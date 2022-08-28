/* 	CAP 5705 - Project 2b - Lewey Geselowitz (id = 7671)
*
*	Tetrahedron Linkage Program
*/

#include "glut.h"
//#include <GL/glut.h>

#include <stdlib.h>
#include <math.h>
#include <stdio.h>
#include <time.h>

#define PI 3.1415926535897932384626433832795
#define RADTODEG(r)		(((r)*180.0f)/PI)

//allows for negative mod values. i.e. MOD(v,b) == MOD(v+b,b) no matter what v is.
int MOD(int v, int b)
{
	if (v >= 0) 
		return (v%b);
	v = ((-v)%b);
	return ((b-v)%b);
}


//This represents a 3d vertex, and lets me use vector notation
//via operator overloading.
struct fpnt
{
	float x, y, z;

	float& operator [] (int i) {return *((&x)+i);};
	operator float* () {return &x;};

	bool operator != (float* other)
	{
		return ((x!=other[0]) || (y!=other[1]) || (z!=other[2]));
	};

	void Set(float ax, float ay, float az)
	{
		x = ax; y = ay; z = az;
	};

	fpnt operator * (float val)
	{
		fpnt ans;
		ans.x = x*val;
		ans.y = y*val;
		ans.z = z*val;
		return ans;
	};

	void operator *= (float val)
	{
		x *= val;
		y *= val;
		z *= val;
	};

	void operator += (float* other)
	{
		x += other[0];
		y += other[1];
		z += other[2];
	};

	void operator -= (float* other)
	{
		x -= other[0];
		y -= other[1];
		z -= other[2];
	};

	fpnt operator / (float val)
	{
		return (*this)*(1.0/val);
	};

	fpnt operator + (fpnt other)
	{
		fpnt ans;
		ans.x = x + other.x;
		ans.y = y + other.y;
		ans.z = z + other.z;
		return ans;
	};

	fpnt operator - (fpnt& other)
	{
		fpnt ans;
		ans.x = x - other.x;
		ans.y = y - other.y;
		ans.z = z - other.z;
		return ans;
	};

	fpnt Lerp(float* vec, float t)
	{
		fpnt ans;
		float nt = 1.0 - t;
		ans.x = x*nt + vec[0]*t;
		ans.y = y*nt + vec[1]*t;
		ans.z = z*nt + vec[2]*t;
		return ans;
	};

	void operator = (float* vec)
	{
		x = vec[0];
		y = vec[1];
		z = vec[2];
	};

	float Dot(float* vec)
	{
		return (x*vec[0] + y*vec[1] + z*vec[2]);
	};

	float Magnitude()
	{
		return sqrt( this->Dot(&x) );
	};

	void Normalize()
	{
		(*this) *= 1.0f/Magnitude();
	};

	fpnt Cross(float* other);
};

struct fmatrix
{
	float Values[16];

	operator float* () {return &Values[0];};
	float* operator [] (int i) {return &Values[4*i];};

	void Transpose();
	void Identity();

	void RotateX(float angle);
	void RotateY(float angle);
	void RotateZ(float angle);
	void Scale(float x, float y, float z);

	fpnt TimesVec(float* other);
	fpnt TimesVecAlt(float* other);
	void MultMatrix(fmatrix* one, fmatrix* two);
	void MultEqual(fmatrix* other);
};

fmatrix _matrixformult;
void fmatrix::MultEqual(fmatrix* other)
{
	_matrixformult.MultMatrix(other, this);
	(*this) = _matrixformult;
}

void fmatrix::Scale(float x, float y, float z)
{
	Identity();

	(*this)[0][0] = x;
	(*this)[1][1] = y;
	(*this)[2][2] = z;
}

void fmatrix::RotateX(float angle)
{
	Identity();
	float s = sin(angle);
	float c = cos(angle);

	(*this)[1][1] = c;
	(*this)[2][1] = -s;
	(*this)[1][2] = s;
	(*this)[2][2] = c;
}

void fmatrix::RotateY(float angle)
{
	Identity();
	float s = sin(angle);
	float c = cos(angle);

	(*this)[0][0] = c;
	(*this)[2][0] = s;
	(*this)[0][2] = -s;
	(*this)[2][2] = c;
}

void fmatrix::RotateZ(float angle)
{
	Identity();
	float s = sin(angle);
	float c = cos(angle);

	(*this)[0][0] = c;
	(*this)[1][0] = -s;
	(*this)[0][1] = s;
	(*this)[1][1] = c;
}

void fmatrix::Identity()
{
	for (int i=0; i<16; i++)
	{
		Values[i] = ((i/4)==(i%4))? 1 : 0;
	}
}

void fmatrix::Transpose()
{
	for (int i=1; i<4; i++)
	{
		for (int j=0; j<i; j++)
		{
			float t = Values[(i*4)+j];
			Values[(i*4)+j] = Values[(j*4)+i];
			Values[(j*4)+i] = t;
		}
	}
}

void fmatrix::MultMatrix(fmatrix* one, fmatrix* two)
{
	float *rowf;
	float *mat = &one->Values[0];
	float *mat2 = &two->Values[0];

	for (int c=0; c<4; c++)
	{
		rowf = &two->Values[c*4];
		for (int i=0; i<4; i++)
		{
			float a = 0;
			for (int j=0; j<4; j++)
			{
				a += rowf[j]*mat[j*4 + i];
			}
			Values[(c*4)+i] = a;
		}
	}
}

fpnt fmatrix::TimesVecAlt(float* other)
{
	fpnt ans;
	for (int i=0; i<3; i++)
	{
		ans[i] = Values[3*4 + i];
		for (int j=0; j<3; j++)
		{
			ans[i] += other[j]*Values[j*4 + i];
		}
	}
	return ans;
}

fpnt fmatrix::TimesVec(float* other)
{
	fpnt ans;
	for (int i=0; i<3; i++)
	{
		ans[i] = Values[i*4 + 3];
		for (int j=0; j<3; j++)
		{
			ans[i] += other[j]*Values[i*4 + j];
		}
	}
	return ans;
}

fpnt fpnt::Cross(float* vec2)
{
	fpnt theans;
	float * ans = theans;
	float * vec1 = &x;
	//float * vec2 = other;
	ans[0]=((vec1[1] * vec2[2]) - (vec1[2] * vec2[1]));
	ans[1]=((vec1[2] * vec2[0]) - (vec1[0] * vec2[2]));
	ans[2]=((vec1[0] * vec2[1]) - (vec1[1] * vec2[0]));
	for (int i=0; i!=3; i++)
		ans[i] *= -1;
	return theans;
}

fpnt FPNT(float x, float y, float z)
{
	fpnt ans;
	ans.x = x; ans.y = y; ans.z = z;
	return ans;
}

fpnt WndSize;
fpnt ViewSize;
float CameraAng = 0; //PI*11.0f/16.0f;
float CameraPitch = 0; //PI/4.0f;
float CameraDist = 10;
fpnt LastMousePos;
bool CameraDrag = false;
float GMyFakeTime=0;

void SetupCamera()
{
	fpnt campos;

	campos.z = cos( CameraAng ) * cos(CameraPitch);
	campos.x = sin( CameraAng ) * cos(CameraPitch);
	campos.y = sin( CameraPitch );
	campos *= CameraDist;

	fpnt up = FPNT(0, 1, 0);
	/*
	fpnt up = campos.Cross( FPNT(0, 1, 0) );
	up = campos.Cross( up )*-1.0f;
	*/

	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	gluLookAt( campos.x, campos.y, campos.z,
		0, 0, 0,
		up.x, up.y, up.z );
}


class Nurbs
{
public:
	int Degree, Width;

	void Init(int degree, int width);
	void UnInit();
	void Flatten();
	void Render_Solid();
	void Render_Grid();
	fpnt* Vertex(int x, int y) {return &verts[x + y*Width];};

	Nurbs() {verts=0; knots=0; cknots=0; Degree=0; Width=0;};
	~Nurbs() {UnInit();};

private:
	fpnt* verts;
	float* knots;
	int cknots;
};

void Nurbs::UnInit()
{
	if (cknots!=0)
	{
		delete [] verts;
		delete [] knots;
	}
	verts=0; knots=0; cknots=0; Degree=0; Width=0;
}

void Nurbs::Flatten()
{
	for (int y=0; y<Width; y++)
	{
		float fy = ((float)y) / ((float)Width-1);
		fy = ((fy*2.0f) - 1.0f);
		for (int x=0; x<Width; x++)
		{
			float fx = ((float)x) / ((float)Width-1);
			fx = ((fx*2.0f) - 1.0f);

			fpnt* v = Vertex(x, y);
			v->Set(fx, fy, 0);
		}
	}
}

void Nurbs::Init(int degree, int width)
{
	UnInit();

	Width = width;
	Degree = degree;

	verts = new fpnt[width*width];

	int knotoffset = degree-1;
	cknots = knotoffset*2 + (degree-1);
	knots = new float[cknots];

	int i=0, j;
	for (j=0; j<knotoffset; j++)
	{
		knots[i++] = 0.0f;
	}
	float max = 0;
	for (j=0; j<Degree-1; j++)
	{
		knots[i++] = (float)j;
		max = (float)j;
	}
	for (j=0; j<knotoffset; j++)
	{
		knots[i++] = max;
	}
}

void Nurbs::Render_Grid()
{
	glEnable(GL_VERTEX_ARRAY);
	glDisable(GL_LIGHTING);
	glVertexPointer(3, GL_FLOAT, 0, verts);

	int y, x;

	glPointSize(5);
	glColor3f( 0, 1, 0);

	glBegin(GL_POINTS);
		for (y=0; y<Width; y++)
		{
			for (x=0; x<Width; x++)
			{
				glArrayElement( x + y*Width );
			}
		}
	glEnd();

	for (y=0; y<Width; y++)
	{
		glBegin(GL_LINE_STRIP);
		for (x=0; x<Width; x++)
		{
			glArrayElement( x + y*Width );
		}
		glEnd();
	}

	glLineWidth(2);
	glColor3f( 1, 1, 1 );

	for (x=0; x<Width; x++)
	{
		glBegin(GL_LINE_STRIP);
		for (y=0; y<Width; y++)
		{
			glArrayElement( x + y*Width );
		}
		glEnd();
	}

	glEnable(GL_LIGHTING);
}

void Nurbs::Render_Solid()
{
	static GLUnurbsObj *surf = 0;
	if (!surf)
	{
		surf = gluNewNurbsRenderer();  // create the nurbs object.
	}

	float diffuseMaterial[] = {0.6, 0.6, 0.6, 1.0};
	float rowMaterial[5][4] = {
		{0.6, 0.1, 0.1, 1.0},
		{0.1, 0.6, 0.1, 1.0}, 
		{0.1, 0.1, 0.6, 1.0},
		{0.6, 0.6, 0.1, 1.0},
		{0.1, 0.6, 0.6, 1.0}};
	float specularMaterial[] = {1.0, 1.0, 1.0, 1.0};
	float shine[] = {24.0};
	glMaterialfv(GL_FRONT_AND_BACK,  GL_AMBIENT_AND_DIFFUSE,   diffuseMaterial);
	glMaterialfv(GL_FRONT_AND_BACK, GL_SPECULAR,  specularMaterial);
	glMaterialfv(GL_FRONT_AND_BACK, GL_SHININESS, shine);


	gluNurbsProperty(surf, GLU_DISPLAY_MODE, GLU_FILL);
	gluBeginSurface(surf);

	/*
	 * You don't need a count of control array points because they
	 * end up being knots - (degree of curve + 1).
	 *
	 * If you have (degree of curve + 1) knots with the same value
	 * the curve will pass through the point.
	 */
	gluNurbsSurface(surf,
			cknots, knots,		// The number and values of knots in the u direction
			cknots, knots,		// The number and values of knots in the v direction
		    Width*3, 3,			// stride -- number of floats between values...
			(float*)verts, //The control points
			Degree, Degree,			// Degree of the curve +1 
			GL_MAP2_VERTEX_3); // Type of data in the controlArray
	gluEndSurface(surf);
}



/*
GLUnurbsObj *NURBSsurface = 0;  // Need a pointer for the nurbs object

void NURBSinit(void)
{
	glShadeModel(GL_SMOOTH);
	glEnable(GL_DEPTH_TEST);


	glEnable(GL_MAP2_VERTEX_3);
	glEnable(GL_LIGHTING);
	glEnable(GL_LIGHT0);
	glEnable(GL_AUTO_NORMAL);
	glEnable(GL_NORMALIZE);
	glLightModeli(GL_LIGHT_MODEL_TWO_SIDE, GL_TRUE);

	float position[] = { 0.0, -8.0, 8.0, 1.0 };

//	glLightfv(GL_LIGHT0, GL_POSITION, position);
	NURBSsurface = gluNewNurbsRenderer();  // create the nurbs object.
}


void ExampleDrawNurbs()
{
	if (!NURBSsurface)
		NURBSinit();

	float xvalue, yvalue;
	int row, column;
	float diffuseMaterial[] = {0.6, 0.6, 0.6, 1.0};
	float rowMaterial[5][4] = {
		{0.6, 0.1, 0.1, 1.0},
		{0.1, 0.6, 0.1, 1.0}, 
		{0.1, 0.1, 0.6, 1.0},
		{0.6, 0.6, 0.1, 1.0},
		{0.1, 0.6, 0.6, 1.0}};
	float specularMaterial[] = {1.0, 1.0, 1.0, 1.0};
	float shine[] = {24.0};

	float uknots[9] = {0.0, 0.0, 0.0, 0.0, 1.0, 2.0, 2.0, 2.0, 2.0};
	float vknots[9] = {0.0, 0.0, 0.0, 0.0, 1.0, 2.0, 2.0, 2.0, 2.0};
	float controlArray[5][5][3] = {
		{{5.0, 5.0, 1.0},	{2.0,  5.0,  4.0},	{ 0.0,  5.0,  2.0}, {-2.0,  5.0,  4.0},	{-5.0,  5.0,  0.0}},
		{{5.0, 2.0, 0.0},	{2.0,  2.0,  2.0},	{ 0.0,  2.0,  1.5}, {-2.0,  2.0,  0.0},	{-5.0,  2.0,  0.0}},
		{{5.0, 0.0, 1.0},   {2.0,  0.0,  2.0},  { 0.0,  0.0, -2.0}, {-2.0,  0.0, -1.0}, {-5.0,  0.0, -1.0}},
		{{5.0,-2.0, 0.0},	{2.0, -2.0, -2.0},	{ 0.0, -2.0,  0.0}, {-2.0, -2.0,  2.0},	{-5.0, -2.0,  0.0}},
		{{5.0,-5.0, 1.0},	{2.0, -5.0, -3.0},	{ 0.0, -5.0, -2.0}, {-2.0, -5.0,  3.0},	{-5.0, -5.0,  0.0}}
	};


	glMaterialfv(GL_FRONT_AND_BACK,  GL_AMBIENT_AND_DIFFUSE,   diffuseMaterial);
	glMaterialfv(GL_FRONT_AND_BACK, GL_SPECULAR,  specularMaterial);
	glMaterialfv(GL_FRONT_AND_BACK, GL_SHININESS, shine);
	gluNurbsProperty(NURBSsurface, GLU_DISPLAY_MODE, GLU_FILL);
	gluBeginSurface(NURBSsurface);

	gluNurbsSurface(NURBSsurface,
			9, uknots,		// The number and values of knots in the u direction
			9, vknots,		// The number and values of knots in the v direction
		    5*3, 3,			// stride -- number of floats between values...
			&controlArray[0][0][0], //The control points
			4, 4,			// Degree of the curve +1 
			GL_MAP2_VERTEX_3); // Type of data in the controlArray
	gluEndSurface(NURBSsurface);
}
*/












void init(void)
{
	glClearColor(0.0, 0.0, 0.0, 0.0);	
	glEnable(GL_DEPTH_TEST);
	glDisable(GL_CULL_FACE);

	glEnable(GL_MAP2_VERTEX_3);
	glEnable(GL_LIGHTING);
	glEnable(GL_LIGHT0);
	glEnable(GL_AUTO_NORMAL);
	glEnable(GL_NORMALIZE);
	glLightModeli(GL_LIGHT_MODEL_TWO_SIDE, GL_TRUE);
}

void DrawObjects(bool usenames)
{
	if (usenames)
		glPushName(0);

	/*
	glColor3f( 0.8, 0.9, 0.8 );
	glBegin(GL_QUADS);
		glVertex3f( -1, -1, 0 );
		glVertex3f(  1, -1, 0 );
		glVertex3f(  1,  1, 0 );
		glVertex3f( -1,  1, 0 );
	glEnd();
	*/

//	ExampleDrawNurbs();
	static Nurbs nurbs;
	if (nurbs.Degree==0)
	{
		nurbs.Init(4, 5);
		nurbs.Flatten();
	}

	nurbs.Render_Solid();
	nurbs.Render_Grid();
}

void display(void)
{	
	//setup the camera
	SetupCamera();

	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	DrawObjects(false);

	glFlush();
	glutSwapBuffers();
}

void FocusOrthoView(float cx, float cy, float sw, float sh)
{
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();

	gluPerspective(45, sw/sh, 0.1, 100);

//	glOrtho(cx-sw, cx+sw, cy-sh, cy+sh, 10, 30);

	glMatrixMode(GL_MODELVIEW);
}

void reshape(int w, int h)
{
	WndSize.x = w;
	WndSize.y = h;

	float ratio = ((float)w) / ((float)h);

	glViewport(0, 0, (GLsizei) w, (GLsizei) h);

 	float vsize = 8;

	ViewSize = FPNT(vsize*ratio, vsize, 0);


	FocusOrthoView( 0, 0, ViewSize.x, ViewSize.y);

	glLoadIdentity();
	gluLookAt( 10, 10, 10,
		0, 0, 0,
		0, -1, 0 );
}

void keyboard_spec(int key, int x, int y)
{
	switch(key)
	{
		/*
	case GLUT_KEY_LEFT:
		GCurTetraDelta = FPNT(-10, 0, 0);
		break;
	case GLUT_KEY_RIGHT:
		GCurTetraDelta = FPNT(10, 0, 0);
		break;
	case GLUT_KEY_UP:
		GCurTetraDelta = FPNT(0, -10, 0);
		break;
	case GLUT_KEY_DOWN:
		GCurTetraDelta = FPNT(0, 10, 0);
		break;
		*/
	default:
		break;
	}
	glutPostRedisplay();
}

void keyboard(unsigned char key, int x, int y)
{
	switch (key) {
	case 27:
		exit(0);
		break;
	default:
		break;
	}
	glutPostRedisplay();
}

/*
#define SELECTBUFFERSIZE	512

#define _HitZ(z)		{if((bestname==-1)||(bestz<(z))){usethis=true;};}
int HitNameFromSelectBuffer(int hits, GLuint* buffer)
{
	GLuint* ptr = (GLuint *)buffer;
	GLuint names;

	int bestname = -1;
	float bestz;

	for (int i = 0; i < hits; i++) //  for each hit
	{
		names = *ptr;
		bool usethis = false;
		ptr++;

		_HitZ(*ptr); ptr++;
		_HitZ(*ptr); ptr++;

		for (int j = 0; j < names; j++) //  for each name
		{
			if (usethis)
				bestname = *ptr;
			ptr++;
		}
	}
	if (bestname == -1)
		return 0;
	return bestname;
}

void onSelect(int x, int y)
{
	GLuint SelectBuffer[SELECTBUFFERSIZE];

	float cvx = ((float)x) / WndSize.x;
	cvx = ((cvx * 2.0) - 1.0) * ViewSize.x;

	float cvy = ((float)y) / WndSize.y;
	cvy = (-((cvy * 2.0) - 1.0)) * ViewSize.y;

	FocusOrthoView(cvx, cvy, 0.025, 0.025);

	glSelectBuffer(SELECTBUFFERSIZE, SelectBuffer);
	glRenderMode( GL_SELECT );
	glInitNames();

	DrawObjects(true);

	int hits = glRenderMode(GL_RENDER);

	int hit = HitNameFromSelectBuffer(hits, SelectBuffer);

	if (hit==0)
		GCurTetra = NULL;
	else
		GCurTetra = &GTetras[hit-1];

	FocusOrthoView(0, 0, ViewSize.x, ViewSize.y);

	glutPostRedisplay();
}
*/

void onMouseClick(int button, int state, int x, int y)
{

	if (state == GLUT_UP)
	{
	}

	if (state == GLUT_DOWN)
	{
//		onSelect(x, y);
	}

	LastMousePos = FPNT(x, y, 0);
}

void onMouseDrag(int x, int y)
{
	if(true) //is rotating camera
	{
		fpnt curpos = FPNT(x, y, 0);
		fpnt d = curpos - LastMousePos;

		CameraAng -= (d.x*PI) / WndSize.x;
		CameraPitch += (d.y*PI) / WndSize.y;
	}

	LastMousePos = FPNT(x, y, 0);
	glutPostRedisplay();
}

void onIdle()
{
	glutPostRedisplay();
}

#define TIMER_LENGTH 20
void onTimer(int extra)
{
	GMyFakeTime += TIMER_LENGTH;
	glutPostRedisplay();
	glutTimerFunc( TIMER_LENGTH, onTimer, 0 );
}

int main(int argc, char** argv)
{
	glutInit(&argc, argv);
	glutInitDisplayMode (GLUT_DOUBLE | GLUT_RGB);
	glutInitWindowSize (600, 600);
	glutInitWindowPosition (100, 100);
	glutCreateWindow ("7671 / Lewey Geselowitz");


	init ();
	glutTimerFunc( TIMER_LENGTH, onTimer, 0 );
//	glutIdleFunc( onIdle );
	glutDisplayFunc(display);
	glutReshapeFunc(reshape);
	glutKeyboardFunc (keyboard);
	glutSpecialUpFunc (keyboard_spec);
	glutMouseFunc( onMouseClick );
	glutMotionFunc( onMouseDrag );
	glutMainLoop();
	return 0;
}


