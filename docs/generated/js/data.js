function getData() {
						
  // global game data
  return {
    "generated": {
      "config": {
        "imagedata": {
          "size": [4096, 4096],
          "spritesheets": [
            "generated/spritesheets/sheet0.png",
            "generated/spritesheets/sheet1.png"
          ],
          "sprites": {
            "landscape.jpg": {"offset": [0, 0], "size": [2560, 978], "index": 0},
            "grass-tile": {"offset": [2568, 0], "size": [1024, 1536], "index": 0},
            "dobuki": {"offset": [3600, 0], "size": [280, 280], "index": 0},
            "cage": {"offset": [3888, 0], "size": [128, 192], "index": 0},
            "blue-wall": {"offset": [4024, 0], "size": [64, 128], "index": 0},
            "access-card": {"offset": [3888, 200], "size": [64, 64], "index": 0},
            "32x64": {"offset": [3960, 200], "size": [32, 64], "index": 0},
            "water": {"offset": [4000, 200], "size": [64, 64], "index": 0},
            "yupa-dance": {"offset": [3600, 288], "size": [256, 256], "index": 0},
            "dude": {"offset": [2568, 1544], "size": [1024, 1024], "index": 0},
            "icefloor.jpg": {
              "offset": [2568, 2576],
              "size": [800, 800],
              "index": 0
            },
            "crystal-wall.jpg": {
              "offset": [2568, 3384],
              "size": [512, 512],
              "index": 0
            },
            "boolbool": {"offset": [0, 986], "size": [1536, 1536], "index": 0},
            "icewall.jpg": {
              "offset": [1544, 986],
              "size": [800, 800],
              "index": 0
            },
            "water.jpg": {"offset": [1544, 1794], "size": [512, 512], "index": 0},
            "tp-boy": {"offset": [0, 0], "size": [1536, 2048], "index": 1},
            "tp": {"offset": [1544, 0], "size": [1536, 2048], "index": 1}
          }
        }
      }
    },
    "schema": {
      "schema": {
        "firstScene": false,
        "init": null,
        "refresh": null,
        "keyboard": {
          "onKeyPress": null,
          "onKeyRelease": null,
          "onLeftPress": null,
          "onLeftRelease": null,
          "onRightPress": null,
          "onRightRelease": null,
          "onDownPress": null,
          "onDownRelease": null,
          "onUpPress": null,
          "onUpRelease": null,
          "onActionPress": null,
          "onActionRelease": null
        },
        "settings": {
          "docBackground": 0,
          "background": 0,
          "curvature": 0,
          "frameRate": 60
        },
        "view": {
          "pos": [0, 0, 0],
          "angle": 45,
          "range": [1, 60],
          "height": 0,
          "turn": 0,
          "cameraDistance": 7
        },
        "light": {
          "pos": [0, 0, 0],
          "ambient": 1,
          "shininess": 3,
          "specularStrength": 0.5,
          "diffusionStrength": 0.5
        },
        "sprites": [
          {
            "src": null,
            "type": 0,
            "hidden": false,
            "pos": [0, 0, 0],
            "grid": [1, 1],
            "animation": {"start": 0, "frame": 0, "range": 1, "frameRate": 0},
            "scale": [1, 1],
            "hotspot": [0, 0],
            "corners": [0, 0, 0, 0],
            "count": 1,
            "init": null,
            "refresh": null
          }
        ]
      }
    },
    "webgl": {
      "fragmentShader": "precision mediump float;\n\nconst int NUM_TEXTURES = 16;\n\nuniform sampler2D uTextures[NUM_TEXTURES];\nvarying mediump vec2 vTexturePoint;\nvarying mediump float zDist;\nvarying mediump float light;\nvarying mediump vec3 vNormal;\nvarying mediump vec3 vFragPos;\nuniform vec4 uBackground;\nuniform vec3 uLightPos;\nuniform vec4 uLightIntensity;\nuniform vec3 uCamPosition;\n\nvec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint) {\n\tint textureInt = int(textureSlot);\n\tfor (int i = 0; i < NUM_TEXTURES; ++i) {\n\t\tif (textureInt == i) {\n\t\t\treturn texture2D(textures[i], vTexturePoint);\n\t\t}\n\t}\n\treturn texture2D(textures[0], vTexturePoint);\n}\n\nvec3 rgb2hsv(vec3 c) {\n    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n\n    float d = q.x - min(q.w, q.y);\n    float e = 1.0e-10;\n    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n}\n\nvec3 hsv2rgb(vec3 c) {\n    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\nvec4 alterHueSatLum(vec4 color, vec3 vHSV) {\n    vec3 fragRGB = color.rgb;\n    vec3 fragHSV = rgb2hsv(fragRGB).xyz;\n    fragHSV.x += vHSV.x;\n    fragHSV.yz *= vHSV.yz;\n    fragRGB = hsv2rgb(fragHSV);\n    return vec4(fragRGB, color.a);\n}\n\nvoid main(void) {\n\tvec3 normal = normalize(vNormal);\n\tvec3 lightDir = normalize(uLightPos - vFragPos.xyz);\n\tvec3 viewDir = normalize(uCamPosition-vFragPos);\n\tfloat ambient = uLightIntensity[0];\n\tfloat diffusion = uLightIntensity[1];\n\tfloat specular = uLightIntensity[2];\n\tfloat shininess = uLightIntensity[3];\n\n\tvec3 reflectDir = reflect(-lightDir, normal);  \n\n\tfloat diffLight = diffusion * max(dot(normal, lightDir), 0.0);\n\tfloat spec = specular * pow(max(dot(viewDir, reflectDir), 0.0), shininess);\n\n\tfloat textureSlot = floor(vTexturePoint.x);\n\tvec2 textureCoord = vec2(mod(vTexturePoint.x, 1.0), vTexturePoint.y);\n\tvec4 color = getTextureColor(uTextures, textureSlot, vTexturePoint);\n\tif (color.w <= 0.1) {\n\t\tdiscard;\n\t}\n\tcolor = alterHueSatLum(color, vec3(1.0, 1.0, min(1.2, max(0.0, .8 + zDist))));\n\tcolor = mix(vec4(color.rgb * (ambient + diffLight + spec), color.a), uBackground, zDist);\n\n\tgl_FragColor = color;\n}\n",
      "vertexShader": "precision mediump float;\n\nattribute vec3 aVertexPosition;\t\t\t//\t[ x, y, z ]\nattribute vec3 aOffset;\t\t\t\t\t//\t[ x, y, z ]\nattribute vec3 aNormal;\t\t\t\t\t//\t[ x, y, z ]\nattribute vec4 aVertexMove;\t\t\t\t//\t[ x, y, z, time ]\nattribute vec3 aVertexGravity;\t\t\t//\t[ x, y, z ]\n\nattribute float aType;\t\t\t\t\t//\twall/floor=0, sprite=1, water=2, ...\n\nattribute vec4 aVertexTextureCoord;\t\t//\t[ x, y, spritewidth, spriteheight ]\nattribute vec4 aAnimationData; \t\t\t//\t[ cols, start, total, frameRate ]\nattribute vec2 aGrid;\t\t\t\t\t//\t[ cols, rows ]\n\nuniform mat4 uProjectionMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uCameraRotation;\nuniform float uCurvature;\nuniform float uNow;\nuniform vec3 uLightPos;  \n\nvarying mediump vec2 vTexturePoint;\nvarying mediump float zDist;\nvarying mediump vec3 vNormal;\nvarying mediump vec3 vFragPos;\n\n\n\nvoid main(void) {\n\tfloat timeStart = aVertexMove.w;\n\tfloat time = uNow - timeStart;\n\tvec4 worldPos = vec4(aVertexPosition, 1.0);\n\tif (aType == 0.0) {\t//\tsprite face camera\n\t\tworldPos = uCameraRotation * worldPos;\n\t}\n\n\tworldPos.xyz += aOffset;\n\n\tif (aType == 7.0) {\t//\twater wave\n\t\tworldPos.y += sin((uNow * 0.05 + worldPos.x * 20.0 + worldPos.z * 50.0) * .2) * .05;\n\t}\n\n\tworldPos.xyz += aVertexMove.xyz * time;\n\tworldPos.xyz += aVertexGravity.xyz * time * time / 2.0;\n\n\tvec4 position = uProjectionMatrix * uViewMatrix * worldPos;\n\tposition.y -= uCurvature * (position.z * position.z + position.x * position.x) / 500.0;\n\n\tfloat cols = aGrid[0];\n\tfloat rows = aGrid[1];\n\tfloat frame = aAnimationData[0];\n\tfloat start = aAnimationData[1];\n\tfloat total = aAnimationData[2];\n\tfloat fps = aAnimationData[3];\n\tfloat index = start + mod(floor(frame + uNow * fps / 1000.0), total);\n\tfloat texCol = mod(index, cols);\n\tfloat texRow = floor(index / cols);\n\tvTexturePoint = aVertexTextureCoord.xy;\n\tvTexturePoint.x += texCol * aVertexTextureCoord[2];\n\tvTexturePoint.y += texRow * aVertexTextureCoord[3];\n\n\tzDist = min(1.0, (abs(position.z / 12.0) + abs(position.y / 10.0)) * .2);\n\tgl_Position = position;\n\tvFragPos = worldPos.xyz;\n\tvNormal = aNormal;\n}"
    }
  };
					
}