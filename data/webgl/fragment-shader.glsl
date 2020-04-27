/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

precision mediump float;

const int NUM_TEXTURES = 16;

uniform sampler2D uTextures[NUM_TEXTURES];
varying vec4 vTextureData;
varying vec2 vTextureSize;
varying float zDist;
varying float light;
varying vec3 vNormal;
varying vec3 vFragPos;
varying float vTextureSlot;
varying float vBrightness;
varying vec4 vTintColor;
varying float vHue;

uniform vec4 uBackground;
uniform vec3 uLightPos;
uniform vec4 uLightIntensity;
uniform vec3 uCamPosition;
uniform vec4 uDepthEffect;

vec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint) {
	int textureInt = int(textureSlot);
	for (int i = 0; i < NUM_TEXTURES; ++i) {
		if (textureInt == i) {
			return texture2D(textures[i], vTexturePoint);
		}
	}
	return texture2D(textures[0], vTexturePoint);
}

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 alterHueSatLum(vec4 color, vec3 vHSV) {
    vec3 fragRGB = color.rgb;
    vec3 fragHSV = rgb2hsv(fragRGB).xyz;
    fragHSV.x += vHSV.x;
    fragHSV.yz *= vHSV.yz;
    fragRGB = hsv2rgb(fragHSV);
    return vec4(fragRGB, color.a);
}

void main(void) {
	vec3 normal = normalize(vNormal);
	vec3 lightDir = normalize(uLightPos - vFragPos.xyz);
	vec3 viewDir = normalize(uCamPosition-vFragPos);
	float ambient = uLightIntensity[0] * vBrightness / 100.0;
	float diffusion = uLightIntensity[1];
	float specular = uLightIntensity[2];
	float shininess = uLightIntensity[3];

	vec3 reflectDir = reflect(-lightDir, normal);  

	float diffLight = diffusion * dot(normal, lightDir);
	float spec = specular * pow(max(dot(viewDir, reflectDir), 0.0), shininess);

	vec4 color;

	//	texture as circle
	vec2 texturePoint = vTextureData.xy;
	vec2 textureCenter = vTextureData.zw;
	if (vTextureSize[0] > 0.0 && vTextureSize[1] > 0.0) {
		vec2 ux = texturePoint;
		float dx = (ux.x - textureCenter.x) / vTextureSize[0];
		float dy = (ux.y - textureCenter.y) / vTextureSize[1];
		float textureDist = sqrt(dx * dx + dy * dy);

		// ux.x = 1.6 * dx * pow(abs(dx), .4) * vTextureSize[0] + vTextureCenter.x;
		// ux.y = 1.6 * dy * pow(abs(dy), .4) * vTextureSize[1] + vTextureCenter.y;

		color = getTextureColor(uTextures, vTextureSlot, ux);		
		color.a *= (.992 - textureDist);
	} else {
		color = getTextureColor(uTextures, vTextureSlot, texturePoint);		
	}

	//	SDF handling, for text and reduced size sprite
    color.a = smoothstep(.5 - .01, .5 + .01, color.a);
	if (color.a <= 0.001) {
		discard;
	}

	float depthFading = uDepthEffect[0];
	float closeSaturation = uDepthEffect[2];
	float farSaturation = uDepthEffect[3];

	//	tint
	color = mix(color, vec4(vTintColor.rgb, color.a), vTintColor.a);
	//	desaturate / blend with background with distance
	float distance = zDist;
	float dValue = smoothstep(0.0, 1.5, distance) / 1.5;
	color = alterHueSatLum(color, vec3(1.0 + vHue, (1.0 - dValue) * closeSaturation + dValue * farSaturation, min(1.2, max(0.0, .8 + distance * .8))));
	color = mix(vec4(color.rgb * (ambient + diffLight + spec), color.a), uBackground, distance * depthFading);

	gl_FragColor = color;
}
