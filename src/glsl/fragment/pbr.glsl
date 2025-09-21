// https://www.shadertoy.com/view/XlKSDR

float PI = 3.141592;
float F_DIELECTRIC = 0.04;

float saturate(float x) {
  return max(x, 0.0);
}

float pow5(float x) {
  float x2 = x * x;
  return x2 * x2 * x;
}

// D - Normal distribution term
float ndfGGX2(float cosTheta, float alpha) {
  float alphaSqr = alpha * alpha;
  float denom = cosTheta * cosTheta * (alphaSqr - 1.0) + 1.0f;
  return alphaSqr / (PI * denom * denom);
}

float ndfGGX(float cosTheta, float alpha) {
  float oneMinus = 1.0 - cosTheta * cosTheta;
  float a = cosTheta * alpha;
  float k = alpha / (oneMinus + a * a);
  float d = k * k * (1.0 / PI);
  return d;
}

// F - Schlick approximation of Fresnel
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  float FT = pow5(1.0f - cosTheta);
  return F0 + (1.0 - F0) * FT;
}

float fresnelSchlick(float cosTheta, float f0, float f90) {
  return f0 + (f90 - f0) * pow(1.0 - cosTheta, 5.0);
}

float fdBurley(float dotNL, float dotNV, float dotLH, float alpha) {
  float f90 = 0.5 + 2.0 * alpha * dotLH * dotLH;
  float lightScatter = fresnelSchlick(dotNL, 1.0, f90);
  float viewScatter = fresnelSchlick(dotNV, 1.0, f90);
  return lightScatter * viewScatter * (1.0 / PI);
}

// G - Geometric attenuation term
float G1X(float dotNX, float k) {
	return 1.0f / (dotNX * (1.0f - k) + k);
}

float smithGGXCorrelated(float dotNL, float dotNV, float alpha) {
  float a2 = alpha * alpha;
  float GGXL = dotNV * sqrt((dotNL - a2 * dotNL) * dotNL + a2);
  float GGXV = dotNL * sqrt((dotNV - a2 * dotNV) * dotNV + a2);
  return 0.5 / (GGXL + GGXV);
}

float geometricGGX(float dotNL, float dotNV, float alpha) {
	float k = alpha / 2.0f;
	return G1X(dotNL, k) * G1X(dotNV, k);
}

// N, L, V must be normalized
export vec3 PBR(vec3 N, vec3 L, vec3 V, vec3 albedo, float metalness, float roughness) {

	vec3 diffuseColor = albedo * (1.0 - metalness);
	vec3 F0 = mix(vec3(F_DIELECTRIC), albedo, metalness);

  float alpha = roughness * roughness;
	float dotNV = saturate(dot(N, V));

  float radiance = 3.1415;

  vec3 H = normalize(V + L);
	float dotNL = saturate(dot(N, L));
	float dotNH = saturate(dot(N, H));
	float dotLH = saturate(dot(L, H));

  vec3 F = fresnelSchlick(dotLH, F0);
  float D = ndfGGX(dotNH, alpha);
  float G = smithGGXCorrelated(dotNL, dotNV, alpha);
  //float G2 = geometricGGX(dotNL, dotNV, alpha);
  //return vec3(abs(G - G2) / 100.0);
  
  vec3 Fd = albedo * fdBurley(dotNL, dotNV, dotLH, alpha);
  vec3 Fs = F * D * G;

  vec3 direct = (Fd + Fs) * radiance * dotNL;
  return direct;
}
