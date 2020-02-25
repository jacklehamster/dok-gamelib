precision mediump float;

attribute vec4 aVertexPosition;			//	[ x, y, z ]
attribute vec4 aVertexMove;				//	[ x, y, z, time ]
attribute vec3 aVertexGravity;			//	[ x, y, z ]

attribute vec4 aVertexTextureCoord;		//	[ x, y, spritewidth, spriteheight ]
attribute vec4 aAnimationData; 			//	[ cols, index, total, frameRate ]

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform float uTimeMillis;

varying mediump vec2 vTexturePoint;
varying mediump float zDist;

void main(void) {
	float timeStart = aVertexMove.w;
	float time = uTimeMillis - timeStart;
	vec4 pos = aVertexPosition;
	pos.x += aVertexMove.x * time;
	pos.y += aVertexMove.y * time;
	pos.z += aVertexMove.z * time;
	pos.x += aVertexGravity.x * time * time / 2.0;
	pos.y += aVertexGravity.y * time * time / 2.0;
	pos.z += aVertexGravity.z * time * time / 2.0;
	vec4 position = uProjectionMatrix * uViewMatrix * pos;

	float total = floor(aAnimationData[2]);
	float fps = aAnimationData[3];
	float index = mod(floor(aAnimationData[1] + uTimeMillis / 1000.0 * fps), total);
	float cols = floor(aAnimationData[0]);
	float texCol = mod(index, cols);
	float texRow = floor(index / cols);
	vTexturePoint = aVertexTextureCoord.xy;
	vTexturePoint.x += texCol * aVertexTextureCoord[2];
	vTexturePoint.y += texRow * aVertexTextureCoord[3];

	zDist = abs(position.z / 12.0) + abs(position.y / 10.0);
	gl_Position = position;
}