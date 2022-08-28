
//ESL Compiler v0.2
//	Written by Lewey Geselowitz
//	Homepage: http://www.leweyg.com/lc/esl/ 
//
//This Material:
//	Target: HLSL/FX
//	Compiled at: 1/10/2006 3:57:13 PM

float4x4 inst0__ModelViewMatrix : MODELVIEW_MATRIX<
		string esl_inst="inst0";
		string esl_name="ModelViewMatrix";>;

float4x4 inst0__ProjMatrix : WORLDPROJECTION_MATRIX<
		string esl_inst="inst0";
		string esl_name="ProjMatrix";>;

float3 inst0__CameraPosition : CAMERA_POS<
		string esl_inst="inst0";
		string esl_name="CameraPosition";
		string esl_uitype="position_world";>;

float3 inst16__LightDirection : LIGHT_0_DIR<
		string esl_inst="inst16";
		string esl_name="LightDirection";
		string esl_uitype="direction_world";>;

texture inst6__Sample : CUBETEXTURE0<
		string esl_inst="inst6";
		string esl_name="Cubic_Texture";
		string type="CUBE";>;

texture inst14__BaseSample : TEXTURE0<
		string esl_inst="inst14";
		string esl_name="Texture";>;

samplerCUBE inst6__Sample__sampler<
		string esl_inst="inst6";
		string esl_name="Cubic_Texture";
		string type="CUBE";> = sampler_state {
	Texture = <inst6__Sample>;
	MipFilter = LINEAR;
	MinFilter = LINEAR;
	MagFilter = LINEAR;
};

sampler inst14__BaseSample__sampler<
		string esl_inst="inst14";
		string esl_name="Texture";> = sampler_state {
	Texture = <inst14__BaseSample>;
	MipFilter = LINEAR;
	MinFilter = LINEAR;
	MagFilter = LINEAR;
};


struct VSOUTPUT { 
	float4 t49 : POSITION;
	float3 t52 : TEXCOORD0;
	float2 t54 : TEXCOORD1;
	float4 t56 : TEXCOORD2;
	float4 t57 : TEXCOORD3;
};

VSOUTPUT mainVS (
	float4 inst0__RawPosition : POSITION<
		string esl_inst="inst0";
		string esl_name="RawPosition";
		string esl_uitype="position_model";>, 
	float3 inst0__RawNormal : NORMAL<
		string esl_inst="inst0";
		string esl_name="RawNormal";
		string esl_uitype="direction_model";>, 
	float2 inst15__BaseValue : TEXCOORD0<
		string esl_inst="inst15";
		string esl_name="UVCoord";>
	)
{
	VSOUTPUT __vsout;
	float4 t3 = mul( inst0__RawPosition, inst0__ModelViewMatrix );
	float3 t9 = ( ( t3 ).xyz - inst0__CameraPosition );
	float3 t12 = mul( inst0__RawNormal, ((float3x3) inst0__ModelViewMatrix )
		);
	__vsout.t49 = mul( t3, inst0__ProjMatrix );
	__vsout.t52 = reflect( t9, t12 );
	__vsout.t54 = inst15__BaseValue;
	__vsout.t56 = ( float4( 1.0, 1.0, 1.0, 1.0 ) * max( 0.0, dot( t12,
		inst16__LightDirection ) ) );
	__vsout.t57 = ( smoothstep( 0.0, 1.0, dot( t12, -( normalize( t9 ) ) ) )
		).xxxx;
	return __vsout;
}

struct PSOUTPUT {
	float4 __final : COLOR0;
};

PSOUTPUT mainPS( VSOUTPUT __vsout )
{
	PSOUTPUT __psout;
	float4 t58 = lerp( texCUBE( inst6__Sample__sampler, __vsout.t52 ), (
		tex2D( inst14__BaseSample__sampler, __vsout.t54 ) * __vsout.t56 ),
		__vsout.t57 );
	__psout.__final = t58;
	return __psout;
}

technique MainTechnique {
	pass P0 {
		VertexShader = compile vs_2_0 mainVS( );
		PixelShader = compile ps_2_0 mainPS( );
}}

