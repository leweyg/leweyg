
//ESL Compiler v0.2
//	Written by Lewey Geselowitz
//	Homepage: http://www.leweyg.com/lc/esl/ 
//
//This Material:
//	Target: HLSL/FX
//	Compiled at: 1/8/2006 10:30:43 PM

float4x4 inst0__ModelViewMatrix : MODELVIEW_MATRIX<
		string esl_inst="inst0";
		string esl_name="ModelViewMatrix";>;

float4x4 inst0__ProjMatrix : WORLDPROJECTION_MATRIX<
		string esl_inst="inst0";
		string esl_name="ProjMatrix";>;

float3 inst6__LightDirection : LIGHT_0_DIR<
		string esl_inst="inst6";
		string esl_name="LightDirection";
		string esl_uitype="direction_world";>;

texture inst4__BaseSample : TEXTURE0<
		string esl_inst="inst4";
		string esl_name="Texture";>;

sampler inst4__BaseSample__sampler<
		string esl_inst="inst4";
		string esl_name="Texture";> = sampler_state {
	Texture = <inst4__BaseSample>;
	MipFilter = LINEAR;
	MinFilter = LINEAR;
	MagFilter = LINEAR;
};


struct VSOUTPUT { 
	float4 t38 : POSITION;
	float2 t40 : TEXCOORD0;
	float4 t43 : TEXCOORD1;
};

VSOUTPUT mainVS (
	float4 inst0__RawPosition : POSITION<
		string esl_inst="inst0";
		string esl_name="RawPosition";
		string esl_uitype="position_model";>, 
	float2 inst5__BaseValue : TEXCOORD0<
		string esl_inst="inst5";
		string esl_name="UVCoord";>, 
	float3 inst0__RawNormal : NORMAL<
		string esl_inst="inst0";
		string esl_name="RawNormal";
		string esl_uitype="direction_model";>
	)
{
	VSOUTPUT __vsout;
	__vsout.t38 = mul( mul( inst0__RawPosition, inst0__ModelViewMatrix ),
		inst0__ProjMatrix );
	__vsout.t40 = inst5__BaseValue;
	__vsout.t43 = ( float4( 1.0, 1.0, 1.0, 1.0 ) * max( 0.0, dot( mul(
		inst0__RawNormal, ((float3x3) inst0__ModelViewMatrix ) ),
		inst6__LightDirection ) ) );
	return __vsout;
}

struct PSOUTPUT {
	float4 __final : COLOR0;
};

PSOUTPUT mainPS( VSOUTPUT __vsout )
{
	PSOUTPUT __psout;
	float4 t44 = ( tex2D( inst4__BaseSample__sampler, __vsout.t40 ) *
		__vsout.t43 );
	__psout.__final = t44;
	return __psout;
}

technique MainTechnique {
	pass P0 {
		VertexShader = compile vs_2_0 mainVS( );
		PixelShader = compile ps_2_0 mainPS( );
}}

