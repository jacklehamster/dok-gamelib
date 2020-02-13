precision mediump float;

attribute vec4 aVertexPosition;
attribute vec4 aVertexMove;

attribute vec4 aVertexTextureCoord;		//	[ x, y, spritewidth, spriteheight ]
attribute vec4 aAnimationData; 			//	[ cols, index, total, frameRate ]

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform vec4 uGravity;
uniform float uNowSec;

varying highp vec2 vTexturePoint;

void main(void) {
	float timeStart = aVertexMove.w;
	float time = uNowSec - timeStart;
	vec4 pos = aVertexPosition;
	pos.x += aVertexMove.x * time;
	pos.y += aVertexMove.y * time;
	pos.z += aVertexMove.z * time;
	pos.x += uGravity.x * time * time / 2.0;
	pos.y += uGravity.y * time * time / 2.0;
	pos.z += uGravity.z * time * time / 2.0;
	gl_Position = uProjectionMatrix * uViewMatrix * pos;

	float total = floor(aAnimationData[2]);
	float fps = aAnimationData[3];
	float index = mod(floor(aAnimationData[1] + time * fps), total);
	float cols = floor(aAnimationData[0]);
	float texCol = mod(index, cols);
	float texRow = floor(index / cols);
	vTexturePoint = aVertexTextureCoord.xy;
	vTexturePoint.x += texCol * aVertexTextureCoord[2];
	vTexturePoint.y += texRow * aVertexTextureCoord[3];
}