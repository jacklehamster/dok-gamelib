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

const SPRITE_TYPE_BYTE_PER_VERTEX	= 1;	//	type

const TEXTURE_FLOAT_PER_VERTEX 		= 4;	//	x,y,w,h
const TEXTURE_CENTER_PER_VERTEX 	= 4;	//	x,y,circleRatio,textureSlot

const ANIMATION_FLOAT_PER_VERTEX 	= 4;	//	time,start,count,frameRate
const GRID_FLOAT_PER_VERTEX 		= 2;	//	cols,rows

const TINT_FLOAT_PER_VERTEX			= 4;	//	tintColor, mix percentage, hue, brightness

const BLACKHOLE_CENTER_FLOAT_PER_VERTEX = 3;	//	x,y,z
const BLACKHOLE_INFO_FLOAT_PER_VERTEX	= 2;	//	strength, distance

const CHROMA_KEY_FLOAT_PER_VERTEX 	= 4;	//	low,high,color,colorAlpha

const VERTICES_PER_SPRITE 			= 4;	//	4 corners
const INDEX_ARRAY_PER_SPRITE = new Uint32Array([
	1,  2,  0,
	0,  2,  3,
]);

const Commands = {
	SCENE_BACKGROUND: 1,
	SCENE_VIEWANGLE: 2,
	SCENE_VIEW_POSITION: 3,
	SCENE_CURVATURE: 4,
	SCENE_LIGHT: 5,
	SCENE_DEPTHEFFECT: 6,
	UI_CREATE_ELEMENT: 7,
	UI_SET_PARENT: 8,
	UI_SET_CLASS: 9,
	UI_SET_STYLE: 10,
	UI_SET_TEXT: 11,
	UI_SET_SIZE: 12,
	UI_SET_CANVAS: 13,
	UI_REMOVE_ELEMENT: 14,
	ENG_NOTIFY_SCENE_CHANGE: 15,
	DOM_BG_COLOR: 16,
	LOGGER_LOG_MESSAGE: 17,
	DATA_SAVE: 18,
	MEDIA_PLAY_MUSIC: 19,
	MEDIA_PAUSE_MUSIC: 20,
	MEDIA_PLAY_VIDEO: 21,
	MEDIA_PAUSE_VIDEO: 22,
	MEDIA_SET_MUSIC_VOLUME: 23,
	NG_UNLOCK_MEDAL: 24,
	NG_POST_SCORE: 25,
	GL_UPDATE_BUFFER: 26,
	GL_SET_VISIBLE_CHUNKS: 27,
	VIEW_RESIZE: 28,
};

const BufferType = {
	SPRITE_TYPE: 1,
	VERTEX: 2,
	OFFSET: 3,
	NORMAL: 4,
	MOVE: 5,
	GRAVITY: 6,
	TEXCOORD: 7,
	TEXCENTER: 8,
	ANIMATION: 9,
	GRID: 10,
	COLOR_EFFECT: 11,
	BLACKHOLE_CENTER: 12,
	BLACKHOLE_INFO: 13,
	CHROMA_KEY: 14,
};

function commandName(command) {
	for (let name in Commands) {
		if(Commands[name] === command) {
			return name;
		}
	}
	return null;
}

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



const MAX_SPRITE = 100000;
const TEXTURE_SIZE = 4096;
const MAX_BUFFER_SIZE = 2000000 * Float32Array.BYTES_PER_ELEMENT;
const VIDEO_TEXTURE_INDEX = 15;

const ZERO_VEC3 = vec3.create();
const IDENTITY_QUAT = quat.identity(quat.create());
const EMPTY_OBJECT = {};
const EMPTY_ARRAY = [];
