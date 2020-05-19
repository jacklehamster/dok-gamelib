/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

precision mediump float;

attribute vec3 aVertexPosition;			//	[ x, y, z ]
attribute vec3 aOffset;					//	[ x, y, z ]
attribute vec3 aNormal;					//	[ x, y, z ]
attribute vec4 aVertexMove;				//	[ x, y, z, time ]
attribute vec3 aVertexGravity;			//	[ x, y, z ]

attribute float aType;					//	wall/floor=0, sprite=1, water=2, ...

attribute vec4 aVertexTextureCoord;		//	[ x, y, spritewidth, spriteheight ]
attribute vec4 aVertexTextureCenter;	//	[ x, y, circleRadiusFactor, textureSlot ]
attribute vec4 aAnimationData; 			//	[ time, start, total, frameRate ]
attribute vec2 aGrid;					//	[ cols, rows ]
attribute vec4 aColorEffect;			//	[ tint color, mix, hue change, brightness ]

attribute vec3 aBlackholeCenter;		//	[ x, y, z ]
attribute vec2 aBlackholeInfo;			//	[ strength, distance ]

attribute vec4 aChromaKey;				//	[ low, high, color, colorAlpha ]

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uCameraRotation;
uniform float uCurvature;
uniform float uNow;
uniform vec3 uLightPos;  

varying vec4 vTextureData;
varying vec2 vTextureSize;
varying float zDist;
varying vec3 vNormal;
varying vec3 vFragPos;
varying float vTextureSlot;
varying float vBrightness;
varying vec4 vTintColor;
varying float vHue;
varying vec3 vChromaKeyLowColor;
varying vec3 vChromaKeyHighColor;
varying vec4 vChromaKeyReplaceColor;

vec4 makeColorFromRGB(float rgb, float mixRatio) {
	return vec4(
		mod(rgb / (256.0 * 256.0), 256.0) / 255.0,
		mod(rgb / 256.0, 256.0) / 255.0,
		mod(rgb, 256.0) / 255.0,
		min(1.0, mixRatio));
}

void main(void) {
	float timeStart = aVertexMove.w;
	float time = uNow - timeStart;
	vec4 worldPos = vec4(aVertexPosition, 1.0);
	vNormal = aNormal;

	if (aType == 1.0) {	//	sprite face camera
		worldPos = uCameraRotation * worldPos;
		vNormal = (uCameraRotation * vec4(vNormal, 1.0)).xyz;
	}

	worldPos.xyz += aOffset + aVertexMove.xyz * time + aVertexGravity.xyz * time * time * 0.5;

	float strength = aBlackholeInfo[0];
	float distance = aBlackholeInfo[1];
	if (strength != 0.0) {	//	apply blackhole (generally used for producing spheres)
		vec3 newWorldPos = mix(worldPos.xyz, aBlackholeCenter, strength);
		if (distance != 0.0) {
			vec3 blackholeToPoint = newWorldPos - aBlackholeCenter;
			if (length(blackholeToPoint) < distance) {
				newWorldPos = normalize(worldPos.xyz - aBlackholeCenter) * distance;
			}
		}
		vNormal = normalize(aBlackholeCenter - newWorldPos);
		worldPos.xyz = newWorldPos;
	}


	if (aType == 8.0) {	//	water wave
		worldPos.y += sin((uNow * 0.05 + worldPos.x * 20.0 + worldPos.z * 50.0) * .2) * .3;
	}

	vec4 position = uProjectionMatrix * uViewMatrix * worldPos;
	position.y -= (position.z * position.z + position.x * position.x) * uCurvature / 500.0;

	float cols = aGrid[0];
	float rows = aGrid[1];
	float animTime = aAnimationData[0];
	float start = aAnimationData[1];
	float total = aAnimationData[2];
	float fps = aAnimationData[3];
	float index = mod(max(0.0, start + mod(floor((uNow - animTime) * fps / 1000.0) + .4, abs(total)) * sign(total)), cols * rows);
	float texRow = floor(index / cols);
	float texCol = floor(mod(index + .4, cols));
	float textureXShift = texCol * aVertexTextureCoord[2];
	float textureYShift = texRow * aVertexTextureCoord[3];
	float circleRadiusFactor = aVertexTextureCenter.z;
	vTextureData.xy = aVertexTextureCoord.xy;
	vTextureData.x = mod(vTextureData.x, 2.0);
	vTextureData.y = mod(vTextureData.y, 2.0);
	vTextureData.zw = aVertexTextureCenter.xy;
	vTextureData.x += textureXShift;
	vTextureData.y += textureYShift;
	vTextureData.z += textureXShift;
	vTextureData.w += textureYShift;
	vTextureSize = aVertexTextureCoord.zw * circleRadiusFactor;
	vTextureSlot = aVertexTextureCenter.w;	
	vTintColor = aColorEffect.y == 0.0 ? vec4(0.0) : makeColorFromRGB(aColorEffect.x, aColorEffect.y);
	vHue = aColorEffect.z;
	vBrightness = aColorEffect.w;

	vChromaKeyLowColor = makeColorFromRGB(aChromaKey[0], 1.0).rgb;
	vChromaKeyHighColor = makeColorFromRGB(aChromaKey[1], 1.0).rgb;
	vChromaKeyReplaceColor = makeColorFromRGB(aChromaKey[2], aChromaKey[3]);

	zDist = min(1.0, (abs(position.z / 12.0) + abs(position.z / 10.0)) * .2);
	gl_Position = position;
	vFragPos = worldPos.xyz;
}