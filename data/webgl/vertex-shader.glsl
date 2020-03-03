precision mediump float;

attribute vec4 aVertexPosition;			//	[ x, y, z ]
attribute vec3 aOffset;					//	[ x, y, z ]
attribute vec4 aVertexMove;				//	[ x, y, z, time ]
attribute vec3 aVertexGravity;			//	[ x, y, z ]

attribute float aType;					//	wall/floor=0, sprite=1, water=2, ...

attribute vec4 aVertexTextureCoord;		//	[ x, y, spritewidth, spriteheight ]
attribute vec4 aAnimationData; 			//	[ cols, index, total, frameRate ]

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uCameraRotation;
uniform float uCurvature;
uniform float uNow;

varying mediump vec2 vTexturePoint;
varying mediump float zDist;

void main(void) {
	float timeStart = aVertexMove.w;
	float time = uNow - timeStart;
	vec4 pos = aVertexPosition;
	if (aType == 0.0) {	//	sprite face camera
		pos = uCameraRotation * pos;
	}

	pos.xyz += aOffset;

	if (aType == 7.0) {	//	water wave
		pos.y += sin((uNow * 0.05 + pos.x * 20.0 + pos.z * 50.0) * .2) * .05;
	}
	pos.y -= uCurvature * (pos.z * pos.z + pos.x * pos.x) / 500.0;

	pos.xyz += aVertexMove.xyz * time;
	pos.xyz += aVertexGravity.xyz * time * time / 2.0;

	vec4 position = uProjectionMatrix * uViewMatrix * pos;

	float total = floor(aAnimationData[2]);
	float fps = aAnimationData[3];
	float index = mod(floor(aAnimationData[1] + uNow * fps / 1000.0), total);
	float cols = floor(aAnimationData[0]);
	float texCol = mod(index, cols);
	float texRow = floor(index / cols);
	vTexturePoint = aVertexTextureCoord.xy;
	vTexturePoint.x += texCol * aVertexTextureCoord[2];
	vTexturePoint.y += texRow * aVertexTextureCoord[3];

	zDist = abs(position.z / 12.0) + abs(position.y / 10.0);
	gl_Position = position;
}