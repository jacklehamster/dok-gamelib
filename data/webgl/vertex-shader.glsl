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
attribute vec4 aVertexTextureCenter;	//	[ x, y, texWidth, texHeight ]
attribute vec4 aAnimationData; 			//	[ time, start, total, frameRate ]
attribute vec2 aGrid;					//	[ cols, rows ]
attribute vec4 aColorEffect;			//	[ tint color, mix, hue change ]

attribute vec3 aBlackholeCenter;		//	[ x, y, z ]
attribute vec2 aBlackholeInfo;			//	[ strength, distance ]

attribute vec3 aChromaKey;				//	[ low, high, color ]

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
varying vec3 vChromaKey;

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

	if (aType == 0.0) {	//	sprite face camera
		worldPos = uCameraRotation * worldPos;
		vNormal = (uCameraRotation * vec4(vNormal, 1.0)).xyz;
	}

	worldPos.xyz += aOffset + aVertexMove.xyz * time + aVertexGravity.xyz * time * time * 0.5;

	float strength = aBlackholeInfo[0];
	float distance = aBlackholeInfo[1];
	if (strength != 0.0) {	//	apply blackhole (generally used for producing spheres)
		worldPos.xyz = mix(worldPos.xyz, aBlackholeCenter, strength);
		if (distance != 0.0) {
			vec3 blackholeToPoint = worldPos.xyz - aBlackholeCenter;
			blackholeToPoint = blackholeToPoint * distance / length(blackholeToPoint);
			worldPos.xyz = aBlackholeCenter + blackholeToPoint;
		}
	}


	if (aType == 7.0) {	//	water wave
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
	vTextureData.xy = aVertexTextureCoord.xy;
	vTextureData.x = mod(vTextureData.x, 2.0);
	vTextureData.y = mod(vTextureData.y, 2.0);
	vTextureData.x += texCol * aVertexTextureCoord[2];
	vTextureData.y += texRow * aVertexTextureCoord[3];
	vTextureData.zw = aVertexTextureCenter.xy;
	vTextureData.z += texCol * aVertexTextureCoord[2];
	vTextureData.w += texRow * aVertexTextureCoord[3];
	vTextureSize = aVertexTextureCenter.zw;

	vTextureSlot = floor(aVertexTextureCoord.x * .5);
	vBrightness = floor(aVertexTextureCoord.y * .5);
	vTintColor = makeColorFromRGB(aColorEffect.x, aColorEffect.y);
	vHue = aColorEffect.z;

	zDist = min(1.0, (abs(position.z / 12.0) + abs(position.z / 10.0)) * .2);
	gl_Position = position;
	vFragPos = worldPos.xyz;
}