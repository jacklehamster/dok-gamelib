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
attribute vec4 aAnimationData; 			//	[ cols, start, total, frameRate ]
attribute vec2 aGrid;					//	[ cols, rows ]
attribute vec2 aTintColor;				//	[ tint color, mix ]

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uCameraRotation;
uniform float uCurvature;
uniform float uNow;
uniform vec3 uLightPos;  

varying vec2 vTexturePoint;
varying vec2 vTextureCenter;
varying vec2 vTextureSize;
varying float zDist;
varying vec3 vNormal;
varying vec3 vFragPos;
varying float vTextureSlot;
varying float vBrightness;
varying vec4 vTintColor;

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
	if (aType == 0.0) {	//	sprite face camera
		worldPos = uCameraRotation * worldPos;
	}
	if (aType == 8.0) {	//	shadow face camera except for tilt
		mat4 M = uCameraRotation;
		float xLen = sqrt(M[0][0]*M[0][0] + M[2][0]*M[2][0]); // Singularity if either of these
		float zLen = sqrt(M[0][2]*M[0][2] + M[2][2]*M[2][2]); //  is equal to zero.

		M[0][0]/=xLen; 	M[1][0]=0.0; 	M[2][0]/=xLen; 	// Set the x column
		M[0][1]=0.0;    M[1][1]=1.0;	M[2][1]=0.0;	// Set the y column
		M[0][2]/zLen;	M[1][2]=0.0; 	M[2][2]/=zLen; 	// Set the z column
		worldPos = M * worldPos;
	}

	worldPos.xyz += aOffset;

	if (aType == 7.0) {	//	water wave
		worldPos.y += sin((uNow * 0.05 + worldPos.x * 20.0 + worldPos.z * 50.0) * .2) * .05;
	}

	worldPos.xyz += aVertexMove.xyz * time;
	worldPos.xyz += aVertexGravity.xyz * time * time / 2.0;

	vec4 position = uProjectionMatrix * uViewMatrix * worldPos;
	position.y -= uCurvature * (position.z * position.z + position.x * position.x) / 500.0;

	float cols = aGrid[0];
	float rows = aGrid[1];
	float animTime = aAnimationData[0];
	float start = aAnimationData[1];
	float total = aAnimationData[2];
	float fps = aAnimationData[3];
	float index = start + mod(floor((uNow - animTime) * fps / 1000.0) + .4, total);
	float texRow = floor(index / cols);
	float texCol = floor(mod(index + .4, cols));
	vTexturePoint = aVertexTextureCoord.xy;
	vTexturePoint.x = mod(vTexturePoint.x, 2.0);
	vTexturePoint.y = mod(vTexturePoint.y, 2.0);
	vTexturePoint.x += texCol * aVertexTextureCoord[2];
	vTexturePoint.y += texRow * aVertexTextureCoord[3];
	vTextureCenter = aVertexTextureCenter.xy;
	vTextureCenter.x += texCol * aVertexTextureCoord[2];
	vTextureCenter.y += texRow * aVertexTextureCoord[3];
	vTextureSize = aVertexTextureCenter.zw;

	vTextureSlot = floor(aVertexTextureCoord.x / 2.0);
	vBrightness = floor(aVertexTextureCoord.y / 2.0);
	vTintColor = makeColorFromRGB(aTintColor[0], aTintColor[1]);

	zDist = min(1.0, (abs(position.z / 12.0) + abs(position.y / 10.0)) * .2);
	gl_Position = position;
	vFragPos = worldPos.xyz;
	vNormal = aNormal;
}