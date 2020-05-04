/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


const FLOAT_PER_VERTEX 				= 3;	//	x,y,z
const NORMAL_FLOAT_PER_VERTEX 		= 3;	//	3 normal
const MOVE_FLOAT_PER_VERTEX 		= 4;	//	x,y,z,time
const GRAVITY_FLOAT_PER_VERTEX 		= 3;	//	x,y,z
const SPRITE_TYPE_FLOAT_PER_VERTEX	= 1;	//	type
const TEXTURE_FLOAT_PER_VERTEX 		= 4;	//	x,y,w,h
const TEXTURE_CENTER_PER_VERTEX 	= 4;	//	x,y,w,h

const ANIMATION_FLOAT_PER_VERTEX 	= 4;	//	time,start,count,frameRate
const GRID_FLOAT_PER_VERTEX 		= 2;	//	cols,rows
const TINT_FLOAT_PER_VERTEX			= 4;	//	tint color, mix percentage

const BLACKHOLE_CENTER_FLOAT_PER_VERTEX = 3;	//	x,y,z
const BLACKHOLE_INFO_FLOAT_PER_VERTEX	= 2;	//	strength, distance

const CHROMA_KEY_FLOAT_PER_VERTEX 	= 4;	//	low,high,color,colorAlpha

const VERTICES_PER_SPRITE 			= 4;	//	4 corners
const INDEX_ARRAY_PER_SPRITE = new Uint32Array([
	1,  2,  0,
	0,  2,  3,
]);


const SpriteType = {
	None: 0,
	Sprite: 1,
	Front: 2,
	Back: 3,
	Floor: 4,
	Ceiling: 5,
	LeftWall: 6,
	RightWall: 7,
	Water: 8,
	Shadow: 9,
};

const ShaderConfig = {
	attributes: {
		vertex: "aVertexPosition",
		offset: "aOffset",
		normal: "aNormal",
		move: "aVertexMove",
		gravity: "aVertexGravity",
		spriteType: "aType",
		texCoord: "aVertexTextureCoord",
		texCenter: "aVertexTextureCenter",
		animation: "aAnimationData",
		grid: "aGrid",
		colorEffect: "aColorEffect",
		blackholeCenter: "aBlackholeCenter",
		blackholeInfo: "aBlackholeInfo",
		chromaKey: "aChromaKey",
	},
	uniforms: {
		projection: "uProjectionMatrix",
		view: "uViewMatrix",
		now: "uNow",
		camRotation: "uCameraRotation",
		camPosition: "uCamPosition",
		lightPosition: "uLightPos",
		lightIntensity: "uLightIntensity",
		curvature: "uCurvature",
		background: "uBackground",
		textures: "uTextures",
		depthEffect: "uDepthEffect",
	},
};



const MAX_SPRITE = 1000000;
const TEXTURE_SIZE = 4096;

const ZERO_VEC3 = vec3.create();
const IDENTITY_QUAT = quat.identity(quat.create());
const EMPTY_OBJECT = {};
const EMPTY_ARRAY = [];
