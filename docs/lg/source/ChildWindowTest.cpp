// ChildWindowTest.cpp : Defines the entry point for the application.
//

#include "stdafx.h"
#include "ChildWindowTest.h"
#define MAX_LOADSTRING 100

#include <assert.h>
#define Assert assert
#define LAssert(stmt) {if (stmt) {MessageBox(0,#stmt,"Assert Passed!",MB_OK);} else {Assert(stmt);}}

#pragma comment(lib, "comctl32.lib") 

// Global Variables:
HINSTANCE hInst;								// current instance
HWND MainWnd;									// Main Window
TCHAR szTitle[MAX_LOADSTRING];					// The title bar text
TCHAR szWindowClass[MAX_LOADSTRING];			// the main window class name

// Forward declarations of functions included in this code module:
ATOM				MyRegisterClass(HINSTANCE hInstance);
BOOL				InitInstance(HINSTANCE, int);
LRESULT CALLBACK	WndProc(HWND, UINT, WPARAM, LPARAM);
LRESULT CALLBACK	About(HWND, UINT, WPARAM, LPARAM);

int APIENTRY _tWinMain(HINSTANCE hInstance,
                     HINSTANCE hPrevInstance,
                     LPTSTR    lpCmdLine,
                     int       nCmdShow)
{
 	// TODO: Place code here.
	MSG msg;
	HACCEL hAccelTable;

	//Setup comman controls and RichEdit
	InitCommonControls();
	LoadLibrary("riched20.dll");

	// Initialize global strings
	LoadString(hInstance, IDS_APP_TITLE, szTitle, MAX_LOADSTRING);
	LoadString(hInstance, IDC_CHILDWINDOWTEST, szWindowClass, MAX_LOADSTRING);
	MyRegisterClass(hInstance);

	// Perform application initialization:
	if (!InitInstance (hInstance, nCmdShow)) 
	{
		return FALSE;
	}

	hAccelTable = LoadAccelerators(hInstance, (LPCTSTR)IDC_CHILDWINDOWTEST);

	// Main message loop:
	while (GetMessage(&msg, NULL, 0, 0)) 
	{
		if (!TranslateAccelerator(msg.hwnd, hAccelTable, &msg)) 
		{
			TranslateMessage(&msg);
			DispatchMessage(&msg);
		}
	}

	return (int) msg.wParam;
}






//	?\-**\N?{.**\N}?{[eE]?[\-\+]**\N}
//	%sign%?\-%whole%**\N?{.%digit%**\N}?{[eE]%power%{?[\-\+]**\N}}
//
//	href\=%name%{*!\.\.html}

//XML Parser:
/*
>docell<
{ 
	*\W \< -\/ %node%**\C
	*{
		*\W -\> -\/ %a%**\C \=
		[
			{ \" %v%*!\" \" }
			{ %v%**{ -\W -\> -\/ # } }
		]
	}
	*\W 
	[ 
		{ \/ \> }
		{ \> *<docell> *\W \< \/ *\C *\W \> }
	]
	%endnode%%%
}

<docell>
*/

//C Style Parser:
/*
>_repop<{ [ \-\+\<\>\\\/\&\| ] }
>isdoubleop<
{
	[
		{ [\-\+\*\&\^\%\!\~\<\>\/] \= }
		{ <_repop><_repop> }
	]
}
*[
	**\W
	{%w%\A*\C}
	{%n%{?\-**\N?{\.**\N}?{[eE]?[\-\+]**\N}}
	{%o%<isdoubleop>}
	{%o%#}
]
*/

//All Links in an HTML file:
/*

*{ ^^{\Whref\=\"} %link%*!\" }

*/

// Operators:
//	?X - X is optional
//	*X - allows any number of Xs to be here
//	**X - requires at least Xs in a series of Xs (same as {X*X} )
//	\x - must be exactly the symbol x (e.g. \\, \>, \*, \?, etc.)
//	\N - must be a number
//	\A - must be a letter (includes underscore)
//	\C - any character (same as [\N\A] )
//	\T - simply true
//	\F - simply false
//	\W - is white space
//	[XYZ...] - must be either X, Y, Z or whatever (can be many)
//	{XYZ...} - must be the sequence of X, Y, Z, etc.
//	-X - X must not be here
//	!X - any single letter other than X (same as {-X#} )
//	# - any character
//	^X - the sequence of characters before X
//	^^X - the sequence of characters ending in X (same as {^XX} )
//	' - toggles current blocks case-sensitivity
//	%NAME%X - if X, then stores "NAME=X;" in the var listings.
//	%NAME%%VALUE% - stores "NAME=VALUE;" in the var listings.

// 

bool _match_casesen = false;
char* _match_vars = 0;
char* _match_funcs[100];
int _match_cfuncs = 0;

void _match_endvars()
{
	if (!_match_vars) return;
	*_match_vars = 0;
}

void _match_writevar(char* str, int len)
{
	if (!_match_vars) return;
	while (len > 0)
	{
		*_match_vars = *str;
		_match_vars++;
		str++;
		len--;
	}
}

bool _match_iswhite(char let)
{
	switch (let)
	{
	case ' ':
	case '\n':
	case '\t':
	case '\r':
		return true;
	default:
		return false;
	}
}

void _blockend(char** format, char start, char end)
{
	int ccount=1;
	char prev = 0;
	while (((*format)[0]!=0) && (ccount>0))
	{
		if (prev != '\\')
		{
			if ( (*format)[0]==start ) ccount++;
			if ( (*format)[0]==end ) ccount--;
		}
		prev = (*format)[0];
		(*format)++;
	}
}

int _matchpiece(char* text, char** format);

int _matchblock(char* text, char** format)
{
	bool done = false;
	int offset=0;
	bool stackcase = _match_casesen;
	while (!done)
	{
		int len = _matchpiece(text+offset, format);
		if (len < 0)
		{
			//find end of block;
			_blockend(format, '{', '}');
			_match_casesen = stackcase;
			return -1;
		}
		offset += len;
		if ( (*format)[0]=='}' )
		{
			done = true;
			(*format)++;
		}
		if ( (*format)[0]==0 )
			done = true;
	}
	_match_casesen = stackcase;
	return offset;
}

#define IFRETONE(stmt) {if (stmt) return 1; else return -1;}
#define TOLOWER(C)		( ((C >= 'A') && (C <= 'Z'))? C+'a'-'A' : C )

int _matchpiece(char* text, char** format)
{
	char cur = (*format)[0];

	switch(cur)
	{
	case 0:
		if (text[0]==0)
		return 0; else return -1;
		break;
	case '{':
		{
			(*format)++;
			return _matchblock(text, format);
		}
		break;
	case '[':
		{
			(*format)++;
			while ( (*format)[0]!=']')
			{
				int len = _matchpiece(text, format);
				if (len >= 0)
				{
					_blockend(format, '[', ']');
					return len;
				}
			}
			(*format)++;
			return -1;
		}
		break;
	case '>':
		{
			(*format)++;
			_match_funcs[_match_cfuncs] = *format;
			_match_cfuncs++;
			while ( (*format)[0]!='<' ) (*format)++;
			while ( _match_iswhite((*format)[0]) ) (*format)++;
			Assert( (*format)[0]=='{' );
			(*format)++;
			_blockend(format, '{', '}');
			return 0;
		}
		break;
	case '<':
		{
			(*format)++;
			for (int i=0; i<_match_cfuncs; i++)
			{
				//carry on here
			}
			Assert(false); //unknown function
			return -1;
		}
		break;
	case '^':
		{
			(*format)++;
			bool doesinc = ((*format)[0] == '^');
			if (doesinc)
				(*format)++;
			char* end = 0;
			int offset = 0;
			while (text[offset])
			{
				end = (*format);
				int len = _matchpiece(text+offset, &end);
				if (len >= 0)
				{
					(*format) = end;
					if (doesinc)
						offset += len;
					return offset;
				}
				offset++;
			}
			(*format)=end;
			return -1;
		}
		break;
	case '*':
		{
			(*format)++;
			bool mustone = ( (*format)[0] == '*' );
			if (mustone)
				(*format)++;
			char* end;
			int offset = 0;
			while (1)
			{
				end = *format;
				int len = _matchpiece(text+offset, &end);
				if (len < 0)
				{
					*format = end;
					if (mustone)
						return -1;
					return offset;
				}
				else
				{
					mustone = false;
					offset += len;
				}
			}
		}
		break;
	case '!':
		{
			(*format)++;
			int len = _matchpiece(text, format);
			if (len >= 0) return -1;
			return 1;
		}
		break;
	case '-':
		{
			(*format)++;
			int len = _matchpiece(text, format);
			if (len >= 0) return -1;
			return 0;
		}
		break;
	case '%':
		{
			(*format)++;
			char* ns = *format;
			while( (*format)[0]!='%' )
			{
				(*format)++;
			}
			char* nameend = (*format);
			(*format)++;
			if ( (*format)[0] != '%' )
			{
				int len = _matchpiece(text, format);
				if (len < 0)
					return -1;
				_match_writevar(ns, nameend-ns);
				_match_writevar("=",1);
				_match_writevar(text, len);
				_match_writevar(";",1);
				return len;
			}
			else
			{
				(*format)++;
				char* vs = *format;
				while( (*format)[0]!='%' )
				{
					(*format)++;
				}
				char* vend = *format;
				(*format)++;
				_match_writevar(ns, nameend-ns);
				_match_writevar("=",1);
				_match_writevar(vs, vend-vs);
				_match_writevar(";",1);
				return 0;
			}
		}
		break;
	case '?':
		{
			(*format)++;
			int len = _matchpiece(text, format);
			if (len < 0) return 0;
			return len;
		}
		break;
	case '#':
		(*format)++;
		if (text[0]!=0) 
			return 1; 
		else 
			return -1;
	case '\'':
		(*format)++;
		_match_casesen = !_match_casesen;
		return 0;
		break;
	case '\\':
		{
			(*format)++;
			char let = (*format)[0];
			(*format)++;
			switch(let)
			{
			case 'T':
				return 0;
			case 'F':
				return -1;
			case 'C':
				if ( (text[0]>='0')&&(text[0]<='9') )
					return 1;
				//there is no break here for a reason!
			case 'A':
				if ((text[0]>='a') && (text[0]<='z'))
					return 1;
				if ((text[0]>='A') && (text[0]<='Z'))
					return 1;
				if (text[0]=='_')
					return 1;
				return -1;
				break;
			case 'W':
				IFRETONE( _match_iswhite(text[0]) );
			case 'N':
				IFRETONE( (text[0]>='0')&&(text[0]<='9') );
			default:
				IFRETONE( let == text[0] );
			}
		}
		break;
	default:
		(*format)++;
		if (_match_casesen)
			IFRETONE(text[0]==cur);
		IFRETONE( TOLOWER(text[0]) == TOLOWER(cur) );
	}
}

bool Matches(char* text, char* format, char* vars = 0)
{
	char* work = format;
	_match_casesen = false;
	_match_vars = vars;
	_match_cfuncs = 0;
	int len = _matchblock(text, &work);
	_match_endvars();
	if (len < 0) 
		return false;
	return (text[len]==0);
}

char GTextBuff1[300];
char GTextBuff2[300];
char GTextBuff3[300];

LRESULT CALLBACK TestTextProc(HWND hDlg, UINT message, WPARAM wParam, LPARAM lParam)
{
	switch (message)
	{
	case WM_INITDIALOG:
		return TRUE;

	case WM_COMMAND:
		switch(LOWORD(wParam))
		{
		case IDOK:
			{
				GetDlgItemText(hDlg, IDC_Text_Str, GTextBuff1, 300);
				GetDlgItemText(hDlg, IDC_Text_Format, GTextBuff2, 300);
				if (Matches(GTextBuff1, GTextBuff2, GTextBuff3))
					SetDlgItemText(hDlg, IDC_Text_Out, GTextBuff3);
				else
					SetDlgItemText(hDlg, IDC_Text_Out, "No Match");

			}
			break;
		case IDCANCEL:
			EndDialog(hDlg, LOWORD(wParam));
			break;
		}
		break;
	}
	return FALSE;
}





void AddRichEditControl()
{
	HWND riched = CreateWindowEx( WS_EX_RIGHTSCROLLBAR,
		RICHEDIT_CLASS,
		"",
		WS_CHILD|WS_TABSTOP|WS_VSCROLL|ES_SUNKEN|ES_AUTOVSCROLL
		|ES_NOHIDESEL|ES_WANTRETURN|ES_MULTILINE ,
		100, 100,
		200, 100,
		MainWnd,
		NULL,
		hInst,
		0 );

	ShowWindow(riched, SW_SHOW);
}

BOOL CALLBACK _EnumResNameFunc(HMODULE hModule, LPCTSTR lpszType, LPTSTR lpszName,LONG_PTR lParam)
{
	int val = 0;
	int about = IDD_ABOUTBOX;
	int seq = IDD_SEQEDIT;
	val ++;
	return TRUE;
}

struct BasicResHeader
{
	DWORD DataSize; 
	DWORD HeaderSize; 
	DWORD _AndMoreJunk;
};

 /* Dialog template */
typedef struct
{
    DWORD      style;
    DWORD      exStyle;
    DWORD      helpId;
    UINT16     nbItems;
    INT16      x;
    INT16      y;
    INT16      cx;
    INT16      cy;
    LPCWSTR    menuName;
    LPCWSTR    className;
    LPCWSTR    caption;
    INT16      pointSize;
    WORD       weight;
    BOOL       italic;
    LPCWSTR    faceName;
    BOOL       dialogEx;
} DLG_TEMPLATE;

#define GET_DWORD(p)	(*((DWORD*)(p)))
#define GET_WORD(p)		(*((WORD*)(p)))
#define TRACE(X)
#define MAKEINTATOMW(atom)  ((LPCWSTR)((ULONG_PTR)((WORD)(atom))))
#define DIALOG_CLASS_ATOMW   MAKEINTATOMW(32770)
int strlenW(LPCWSTR str)
{
	int ans=0;
	while (str[ans])
		ans++;
	return ans*2;
}
/***********************************************************************
 *           DIALOG_ParseTemplate32
 *
 * Fill a DLG_TEMPLATE structure from the dialog template, and return
 * a pointer to the first control.
 */
static LPCSTR DIALOG_ParseTemplate32( LPCSTR templat, DLG_TEMPLATE * result )
{
    const WORD *p = (const WORD *)templat;

    result->style = GET_DWORD(p); p += 2;
    if (result->style == 0xffff0001)  /* DIALOGEX resource */
    {
        result->dialogEx = TRUE;
        result->helpId   = GET_DWORD(p); p += 2;
        result->exStyle  = GET_DWORD(p); p += 2;
        result->style    = GET_DWORD(p); p += 2;
    }
    else
    {
        result->dialogEx = FALSE;
        result->helpId   = 0;
        result->exStyle  = GET_DWORD(p); p += 2;
    }
    result->nbItems = GET_WORD(p); p++;
    result->x       = GET_WORD(p); p++;
    result->y       = GET_WORD(p); p++;
    result->cx      = GET_WORD(p); p++;
    result->cy      = GET_WORD(p); p++;
    TRACE("DIALOG%s %d, %d, %d, %d, %ld\n",
           result->dialogEx ? "EX" : "", result->x, result->y,
           result->cx, result->cy, result->helpId );
    TRACE(" STYLE 0x%08lx\n", result->style );
    TRACE(" EXSTYLE 0x%08lx\n", result->exStyle );

    /* Get the menu name */

    switch(GET_WORD(p))
    {
    case 0x0000:
        result->menuName = NULL;
        p++;
        break;
    case 0xffff:
        result->menuName = (LPCWSTR)(UINT)GET_WORD( p + 1 );
        p += 2;
	TRACE(" MENU %04x\n", LOWORD(result->menuName) );
        break;
    default:
        result->menuName = (LPCWSTR)p;
        TRACE(" MENU %s\n", debugstr_w(result->menuName) );
        p += strlenW( result->menuName ) + 1;
        break;
    }

    /* Get the class name */

    switch(GET_WORD(p))
    {
    case 0x0000:
        result->className = DIALOG_CLASS_ATOMW;
        p++;
        break;
    case 0xffff:
        result->className = (LPCWSTR)(UINT)GET_WORD( p + 1 );
        p += 2;
	TRACE(" CLASS %04x\n", LOWORD(result->className) );
        break;
    default:
        result->className = (LPCWSTR)p;
        TRACE(" CLASS %s\n", debugstr_w( result->className ));
        p += strlenW( result->className ) + 1;
        break;
    }

    /* Get the window caption */

    result->caption = (LPCWSTR)p;
    p += strlenW( result->caption ) + 1;
    TRACE(" CAPTION %s\n", debugstr_w( result->caption ) );

    /* Get the font name */

    if (result->style & DS_SETFONT)
    {
	result->pointSize = GET_WORD(p);
        p++;
        if (result->dialogEx)
        {
            result->weight = GET_WORD(p); p++;
            result->italic = LOBYTE(GET_WORD(p)); p++;
        }
        else
        {
            result->weight = FW_DONTCARE;
            result->italic = FALSE;
        }
	result->faceName = (LPCWSTR)p;
        p += strlenW( result->faceName ) + 1;
	TRACE(" FONT %d, %s, %d, %s\n",
              result->pointSize, debugstr_w( result->faceName ),
              result->weight, result->italic ? "TRUE" : "FALSE" );
    }

    /* First control is on dword boundary */
    return (LPCSTR)((((int)p) + 3) & ~3);
}


void OpenMyDialog(bool aschild)
{
	if (!aschild)
	{
		DialogBox(hInst, (LPCTSTR)IDD_SEQEDIT, MainWnd, (DLGPROC)About);
	}
	else
	{
		//Assert(false);
		//EnumResourceNames(NULL, RT_DIALOG, _EnumResNameFunc, 0);

		/*
		WNDCLASS cls;
		BOOL b = GetClassInfo(hInst, "DIALOG", &cls);
		LAssert(b);
		*/

		HRSRC res = FindResource(NULL, (LPCSTR)IDD_SEQEDIT, RT_DIALOG);
		Assert(res);
		int rsize = SizeofResource(NULL, res);
		HGLOBAL hg = LoadResource(NULL, res);
		void* data = LockResource(hg);

		DLGITEMTEMPLATE* dlg;
		rsize = sizeof(dlg);

		DLG_TEMPLATE temp, *work;
		work = (DLG_TEMPLATE*)DIALOG_ParseTemplate32( (LPCSTR)data, &temp );

		rsize = 0;
		//UnlockResource(hg);
	}
}

LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam)
{
	int wmId, wmEvent;
	PAINTSTRUCT ps;
	HDC hdc;

	switch (message) 
	{
	case WM_CREATE:
		MainWnd = hWnd;
		break;
	case WM_COMMAND:
		wmId    = LOWORD(wParam); 
		wmEvent = HIWORD(wParam); 
		// Parse the menu selections:
		switch (wmId)
		{
		case IDM_TEST_TEST1:
			AddRichEditControl();
			break;
		case IDM_TEST_TEST2:
			OpenMyDialog(true);
			break;
		case IDM_TEST_TEST3:
			DialogBox(hInst, (LPCTSTR)IDD_TextTest, hWnd, (DLGPROC)TestTextProc);
			break;
		case IDM_ABOUT:
			DialogBox(hInst, (LPCTSTR)IDD_ABOUTBOX, hWnd, (DLGPROC)About);
			break;
		case IDM_EXIT:
			DestroyWindow(hWnd);
			break;
		default:
			return DefWindowProc(hWnd, message, wParam, lParam);
		}
		break;
	case WM_PAINT:
		{
			hdc = BeginPaint(hWnd, &ps);
			RECT rect;
			GetClientRect(hWnd, &rect);
			FillRect(hdc, &rect, (HBRUSH)GetStockObject(LTGRAY_BRUSH));
			EndPaint(hWnd, &ps);
		}
		break;
	case WM_DESTROY:
		PostQuitMessage(0);
		break;
	default:
		return DefWindowProc(hWnd, message, wParam, lParam);
	}
	return 0;
}






















ATOM MyRegisterClass(HINSTANCE hInstance)
{
	WNDCLASSEX wcex;

	wcex.cbSize = sizeof(WNDCLASSEX); 

	wcex.style			= CS_HREDRAW | CS_VREDRAW;
	wcex.lpfnWndProc	= (WNDPROC)WndProc;
	wcex.cbClsExtra		= 0;
	wcex.cbWndExtra		= 0;
	wcex.hInstance		= hInstance;
	wcex.hIcon			= LoadIcon(hInstance, (LPCTSTR)IDI_CHILDWINDOWTEST);
	wcex.hCursor		= LoadCursor(NULL, IDC_ARROW);
	wcex.hbrBackground	= (HBRUSH)(COLOR_WINDOW+1);
	wcex.lpszMenuName	= (LPCTSTR)IDC_CHILDWINDOWTEST;
	wcex.lpszClassName	= szWindowClass;
	wcex.hIconSm		= LoadIcon(wcex.hInstance, (LPCTSTR)IDI_SMALL);

	return RegisterClassEx(&wcex);
}



BOOL InitInstance(HINSTANCE hInstance, int nCmdShow)
{
   HWND hWnd;

   hInst = hInstance; // Store instance handle in our global variable

   hWnd = CreateWindow(szWindowClass, szTitle, WS_OVERLAPPEDWINDOW,
      CW_USEDEFAULT, 0, CW_USEDEFAULT, 0, NULL, NULL, hInstance, NULL);

   if (!hWnd)
   {
      return FALSE;
   }

   ShowWindow(hWnd, nCmdShow);
   UpdateWindow(hWnd);

   return TRUE;
}




// Message handler for about box.
LRESULT CALLBACK About(HWND hDlg, UINT message, WPARAM wParam, LPARAM lParam)
{
	switch (message)
	{
	case WM_INITDIALOG:
		return TRUE;

	case WM_COMMAND:
		if (LOWORD(wParam) == IDOK || LOWORD(wParam) == IDCANCEL) 
		{
			EndDialog(hDlg, LOWORD(wParam));
			return TRUE;
		}
		break;
	}
	return FALSE;
}
