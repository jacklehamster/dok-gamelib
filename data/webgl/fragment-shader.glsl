precision mediump float;

const int NUM_TEXTURES = 16;

uniform sampler2D uTextures[NUM_TEXTURES];
varying highp vec2 vTexturePoint;

vec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint) {
	int textureInt = int(textureSlot);
	for (int i = 0; i < NUM_TEXTURES; ++i) {
		if (textureInt == i) {
			return texture2D(textures[i], vTexturePoint);
		}
	}
	return texture2D(textures[0], vTexturePoint);
}

void main(void) {
	float textureSlot = floor(vTexturePoint.x);
	vec2 textureCoord = vec2(mod(vTexturePoint.x, 1.0), vTexturePoint.y);
	vec4 color = getTextureColor(uTextures, textureSlot, vTexturePoint);
	if (color.w <= 0.0) {
		discard;
	}

	gl_FragColor = color;
}
