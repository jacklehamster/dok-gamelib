precision mediump float;

attribute vec3 aVertexPosition;			//	[ x, y, z ]
attribute vec3 aOffset;					//	[ x, y, z ]
attribute vec3 aNormal;					//	[ x, y, z ]
attribute vec4 aVertexMove;				//	[ x, y, z, time ]
attribute vec3 aVertexGravity;			//	[ x, y, z ]

attribute float aType;					//	wall/floor=0, sprite=1, water=2, ...

attribute vec4 aVertexTextureCoord;		//	[ x, y, spritewidth, spriteheight ]
attribute vec4 aAnimationData; 			//	[ cols, start, total, frameRate ]
attribute vec2 aGrid;					//	[ cols, rows ]

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uCameraRotation;
uniform float uCurvature;
uniform float uNow;
uniform vec3 uLightPos;  

varying mediump vec2 vTexturePoint;
varying mediump float zDist;
varying mediump vec3 vNormal;
varying mediump vec3 vFragPos;
varying mediump float vTextureSlot;
varying mediump float vBrightness;


void main(void) {
	float timeStart = aVertexMove.w;
	float time = uNow - timeStart;
	vec4 worldPos = vec4(aVertexPosition, 1.0);
	if (aType == 0.0) {	//	sprite face camera
		worldPos = uCameraRotation * worldPos;
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
	float frame = aAnimationData[0];
	float start = aAnimationData[1];
	float total = aAnimationData[2];
	float fps = aAnimationData[3];
	float index = start + mod(floor(frame + uNow * fps / 1000.0), total);
	float texCol = mod(index, cols);
	float texRow = floor(index / cols);
	vTexturePoint = aVertexTextureCoord.xy;
	vTexturePoint.x = mod(vTexturePoint.x, 2.0);
	vTexturePoint.y = mod(vTexturePoint.y, 2.0);
	vTexturePoint.x += texCol * aVertexTextureCoord[2];
	vTexturePoint.y += texRow * aVertexTextureCoord[3];

	vTextureSlot = floor(aVertexTextureCoord.x / 2.0);
	vBrightness = floor(aVertexTextureCoord.y / 2.0);

	zDist = min(1.0, (abs(position.z / 12.0) + abs(position.y / 10.0)) * .2);
	gl_Position = position;
	vFragPos = worldPos.xyz;
	vNormal = aNormal;
}