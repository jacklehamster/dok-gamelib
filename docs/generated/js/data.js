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
      "fragmentShader": "precision mediump float;\n\nconst int NUM_TEXTURES = 16;\n\nuniform sampler2D uTextures[NUM_TEXTURES];\nvarying mediump vec2 vTexturePoint;\nvarying mediump float zDist;\nuniform vec4 uBackground;\n\nvec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint) {\n\tint textureInt = int(textureSlot);\n\tfor (int i = 0; i < NUM_TEXTURES; ++i) {\n\t\tif (textureInt == i) {\n\t\t\treturn texture2D(textures[i], vTexturePoint);\n\t\t}\n\t}\n\treturn texture2D(textures[0], vTexturePoint);\n}\n\nvec3 rgb2hsv(vec3 c) {\n    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n\n    float d = q.x - min(q.w, q.y);\n    float e = 1.0e-10;\n    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n}\n\nvec3 hsv2rgb(vec3 c) {\n    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\nvec4 alterHueSatLum(vec4 color, vec3 vHSV) {\n    vec3 fragRGB = color.rgb;\n    vec3 fragHSV = rgb2hsv(fragRGB).xyz;\n    fragHSV.x += vHSV.x;\n    fragHSV.yz *= vHSV.yz;\n    fragRGB = hsv2rgb(fragHSV);\n    return vec4(fragRGB, color.a);\n}\n\nvoid main(void) {\n\tfloat textureSlot = floor(vTexturePoint.x);\n\tvec2 textureCoord = vec2(mod(vTexturePoint.x, 1.0), vTexturePoint.y);\n\tvec4 color = getTextureColor(uTextures, textureSlot, vTexturePoint);\n\tif (color.w <= 0.1) {\n\t\tdiscard;\n\t}\n\tcolor = alterHueSatLum(color, vec3(1.0, 1.0, min(1.2,max(0.0, .8 + zDist * .3))));\n\tcolor = mix(color, uBackground, min(1.0, zDist * 0.3));\n\n\tgl_FragColor = color;\n}\n",
      "vertexShader": "precision mediump float;\n\nattribute vec4 aVertexPosition;\t\t\t//\t[ x, y, z ]\nattribute vec3 aOffset;\t\t\t\t\t//\t[ x, y, z ]\nattribute vec4 aVertexMove;\t\t\t\t//\t[ x, y, z, time ]\nattribute vec3 aVertexGravity;\t\t\t//\t[ x, y, z ]\n\nattribute float aType;\t\t\t\t\t//\twall/floor=0, sprite=1, water=2, ...\n\nattribute vec4 aVertexTextureCoord;\t\t//\t[ x, y, spritewidth, spriteheight ]\nattribute vec4 aAnimationData; \t\t\t//\t[ cols, index, total, frameRate ]\n\nuniform mat4 uProjectionMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uCameraRotation;\nuniform float uTimeMillis;\n\nvarying mediump vec2 vTexturePoint;\nvarying mediump float zDist;\n\nvoid main(void) {\n\tfloat timeStart = aVertexMove.w;\n\tfloat time = uTimeMillis - timeStart;\n\tvec4 pos = aVertexPosition;\n\tif (aType == 1.0) {\n\t\tpos = uCameraRotation * pos;\n\t}\n\tpos.xyz += aOffset;\n\tpos.xyz += aVertexMove.xyz * time;\n\tpos.xyz += aVertexGravity.xyz * time * time / 2.0;\n\n\tvec4 position = uProjectionMatrix * uViewMatrix * pos;\n\n\tfloat total = floor(aAnimationData[2]);\n\tfloat fps = aAnimationData[3];\n\tfloat index = mod(floor(aAnimationData[1] + uTimeMillis * fps / 1000.0), total);\n\tfloat cols = floor(aAnimationData[0]);\n\tfloat texCol = mod(index, cols);\n\tfloat texRow = floor(index / cols);\n\tvTexturePoint = aVertexTextureCoord.xy;\n\tvTexturePoint.x += texCol * aVertexTextureCoord[2];\n\tvTexturePoint.y += texRow * aVertexTextureCoord[3];\n\n\tzDist = abs(position.z / 12.0) + abs(position.y / 10.0);\n\tgl_Position = position;\n}"
    }
  };
					
}