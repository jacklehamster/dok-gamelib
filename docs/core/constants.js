const FLOAT_PER_VERTEX 				= 3;	//	x,y,z
const MOVE_FLOAT_PER_VERTEX 		= 4;	//	x,y,z,time
const GRAVITY_FLOAT_PER_VERTEX 		= 3;	//	x,y,z
const SPRITE_TYPE_FLOAT_PER_VERTEX	= 1;	//	type
const TEXTURE_FLOAT_PER_VERTEX 		= 4;	//	x,y,w,h
const ANIMATION_FLOAT_PER_VERTEX 	= 4;	//	cols,index,count,frameRate
const VERTICES_PER_SPRITE 			= 4;	//	4 corners
const INDEX_ARRAY_PER_SPRITE = new Uint16Array([
	0,  1,  2,
	0,  2,  3,
]);

const SpriteType = {
	Sprite: 0,
	Front: 1,
	Back: 2,
	Floor: 3,
	Ceiling: 4,
	LeftWall: 5,
	RightWall: 6,
};

const MAX_TEXTURES = 16;
const MAX_SPRITE = 16000;
const TEXTURE_SIZE = 4096;

const ZERO_VEC3 = vec3.create();
const IDENTITY_QUAT = quat.identity(quat.create());
