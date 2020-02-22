function getData() {
						
  // global game data
  return {
    "generated": {
      "config": {
        "imagedata": {
          "size": [4096, 4096],
          "spritesheets": ["generated/spritesheets/sheet0.png"],
          "sprites": {
            "dobuki": {"offset": [0, 0], "size": [280, 280], "index": 0},
            "yupa-dance": {"offset": [280, 0], "size": [256, 256], "index": 0},
            "cage": {"offset": [536, 0], "size": [128, 192], "index": 0},
            "penguin-bot-left": {
              "offset": [664, 0],
              "size": [128, 128],
              "index": 0
            },
            "penguin-down": {"offset": [792, 0], "size": [128, 128], "index": 0},
            "penguin-right": {"offset": [920, 0], "size": [128, 128], "index": 0},
            "penguin-top-left": {
              "offset": [1048, 0],
              "size": [128, 128],
              "index": 0
            },
            "penguin-up": {"offset": [1176, 0], "size": [128, 128], "index": 0},
            "32x64": {"offset": [1304, 0], "size": [32, 64], "index": 0},
            "access-card": {"offset": [1336, 0], "size": [64, 64], "index": 0},
            "water": {"offset": [1400, 0], "size": [64, 64], "index": 0}
          }
        }
      }
    },
    "webgl": {
      "fragmentShader": "precision mediump float;\n\nconst int NUM_TEXTURES = 16;\n\nuniform sampler2D uTextures[NUM_TEXTURES];\nvarying highp vec2 vTexturePoint;\n\nvec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint) {\n\tint textureInt = int(textureSlot);\n\tfor (int i = 0; i < NUM_TEXTURES; ++i) {\n\t\tif (textureInt == i) {\n\t\t\treturn texture2D(textures[i], vTexturePoint);\n\t\t}\n\t}\n\treturn texture2D(textures[0], vTexturePoint);\n}\n\nvoid main(void) {\n\tfloat textureSlot = floor(vTexturePoint.x);\n\tvec2 textureCoord = vec2(mod(vTexturePoint.x, 1.0), vTexturePoint.y);\n\tvec4 color = getTextureColor(uTextures, textureSlot, vTexturePoint);\n\tif (color.w <= 0.0) {\n\t\tdiscard;\n\t}\n\n\tgl_FragColor = color;\n}\n",
      "vertexShader": "precision mediump float;\n\nattribute vec4 aVertexPosition;\nattribute vec4 aVertexMove;\t\t\t\t//\t[ x, y, z, time ]\nattribute vec3 aVertexGravity;\t\t\t//\t[ x, y, z ]\n\nattribute vec4 aVertexTextureCoord;\t\t//\t[ x, y, spritewidth, spriteheight ]\nattribute vec4 aAnimationData; \t\t\t//\t[ cols, index, total, frameRate ]\n\nuniform mat4 uProjectionMatrix;\nuniform mat4 uViewMatrix;\nuniform float uNowSec;\n\nvarying highp vec2 vTexturePoint;\n\nvoid main(void) {\n\tfloat timeStart = aVertexMove.w;\n\tfloat time = uNowSec - timeStart;\n\tvec4 pos = aVertexPosition;\n\tpos.x += aVertexMove.x * time;\n\tpos.y += aVertexMove.y * time;\n\tpos.z += aVertexMove.z * time;\n\tpos.x += aVertexGravity.x * time * time / 2.0;\n\tpos.y += aVertexGravity.y * time * time / 2.0;\n\tpos.z += aVertexGravity.z * time * time / 2.0;\n\tgl_Position = uProjectionMatrix * uViewMatrix * pos;\n\n\tfloat total = floor(aAnimationData[2]);\n\tfloat fps = aAnimationData[3];\n\tfloat index = mod(floor(aAnimationData[1] + time * fps), total);\n\tfloat cols = floor(aAnimationData[0]);\n\tfloat texCol = mod(index, cols);\n\tfloat texRow = floor(index / cols);\n\tvTexturePoint = aVertexTextureCoord.xy;\n\tvTexturePoint.x += texCol * aVertexTextureCoord[2];\n\tvTexturePoint.y += texRow * aVertexTextureCoord[3];\n}"
    }
  };
					
}