function getData() {
					
  // global game data
  return {
    "generated": {
      "config": {
        "game": {
          "title": "Hello World",
          "description": "Description",
          "width": 800,
          "height": 500,
          "fonts": {
            "comic": {
              "name": "Comic Sans MS",
              "characters": "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz.,?'#@!♪()[]/-+_“”éè:©% ",
              "fontSize": 160,
              "cellSize": 256
            }
          }
        },
        "imagedata": {
          "size": [4096, 4096],
          "spritesheets": [
            "generated/spritesheets/sheet0.png",
            "generated/spritesheets/sheet1.png"
          ],
          "sprites": {
            "landscape.jpg": {"offset": [0, 0], "size": [2560, 978], "index": 0},
            "grass-tile": {"offset": [2568, 0], "size": [1024, 1536], "index": 0},
            "comic": {"offset": [3600, 0], "size": [320, 288], "index": 0},
            "zombie": {"offset": [3928, 0], "size": [128, 192], "index": 0},
            "color-blocks": {"offset": [4064, 0], "size": [2, 2], "index": 0},
            "access-card": {"offset": [3928, 200], "size": [64, 64], "index": 0},
            "32x64": {"offset": [4000, 200], "size": [32, 64], "index": 0},
            "a": {"offset": [4040, 200], "size": [32, 32], "index": 0},
            "dobuki": {"offset": [3600, 296], "size": [280, 280], "index": 0},
            "cage": {"offset": [3888, 296], "size": [128, 192], "index": 0},
            "blue-wall": {"offset": [4024, 296], "size": [64, 128], "index": 0},
            "gun": {"offset": [3888, 496], "size": [128, 128], "index": 0},
            "water": {"offset": [4024, 496], "size": [64, 64], "index": 0},
            "yupa-dance": {"offset": [3600, 584], "size": [256, 256], "index": 0},
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
          },
          "freeCells": [
            {"offset": [4074, 0], "size": [22, 10], "index": 0},
            {"offset": [4064, 10], "size": [32, 190], "index": 0},
            {"offset": [4080, 200], "size": [16, 40], "index": 0},
            {"offset": [4040, 240], "size": [56, 32], "index": 0},
            {"offset": [4000, 272], "size": [96, 24], "index": 0},
            {"offset": [3928, 272], "size": [72, 24], "index": 0},
            {"offset": [4024, 432], "size": [72, 64], "index": 0},
            {"offset": [4024, 568], "size": [72, 976], "index": 0},
            {"offset": [3888, 632], "size": [136, 912], "index": 0},
            {"offset": [3864, 584], "size": [24, 960], "index": 0},
            {"offset": [3600, 848], "size": [264, 696], "index": 0},
            {"offset": [3600, 1544], "size": [496, 2552], "index": 0},
            {"offset": [3376, 2576], "size": [224, 1520], "index": 0},
            {"offset": [3088, 3384], "size": [288, 712], "index": 0},
            {"offset": [2568, 3904], "size": [520, 192], "index": 0},
            {"offset": [2352, 986], "size": [216, 808], "index": 0},
            {"offset": [2064, 1794], "size": [504, 2302], "index": 0},
            {"offset": [1544, 2314], "size": [520, 1782], "index": 0},
            {"offset": [0, 2530], "size": [1544, 1566], "index": 0},
            {"offset": [3088, 0], "size": [1008, 2056], "index": 1},
            {"offset": [1544, 2056], "size": [2552, 2040], "index": 1},
            {"offset": [0, 2056], "size": [1544, 2040], "index": 1}
          ]
        },
        "sha": [
          "32x64=243fc25a0a5f1039a9d1e6de34b8c829d8cd295480d3cd6b685d149dc670de06",
          "a=3a374069b002d080d0425916341d832f9938e0ca4408b07d2c800d0ff593f621",
          "access-card=f099f0d2076d4794c1c384e203654c3ac41f6f40a6bfa8031f5fa3b81fb6ba1f",
          "blue-wall=afe2a99e5a6f1f0d82fd25723ba02da78ae5d251a333b8bd6bc7cd4f1f88b257",
          "boolbool=bbdeeb3ccc0dd018fae8c83561dcbb2ed6cb161761916b2ed329f1d8fda06b0c",
          "cage=ddb62921f34a01ab79047d789ac090ee530b603b22d234747431625358ca6dd1",
          "color-blocks=afee4762dd872c26c4efdc0c3e8d02c3e8ac72ae88864221f1efebc0ad8829a9",
          "comic=07daae65673b874e54e3c195ef3ecc32f939661d9251a61e90932477046eab87",
          "crystal-wall.jpg=b13dc3e43cbb80a18501d4b9e177920e4db02722db873bbefb39a711ffc1295a",
          "dobuki=68170001dff751094f728f353190b79f6c270ddec113962f68a97f76ae9a5b00",
          "dude=d78885bc5a0c826745e3d6ba9fa95d2100afc854d179163dffb6f7dd64264cab",
          "grass-tile=f198927b5af525fb90fb7f6969893685f4b8b8bf008bfa6951c57092c7f33ce6",
          "gun=cc82ad5fb0f9d24f82d195decd1f57af69e4bc6072f930927c5cf588b1e52226",
          "icefloor.jpg=f7d4ce79235b500ee9558ffbcc88c61a1a7864b67f934109633754ad824d6e6c",
          "icewall.jpg=450e93a073b150b27034e5c4ef8ca5979c42f103899ede49d546188986331b4e",
          "landscape.jpg=07fe4f08f11cfe8dfd3dcd7bb5124a40874db70f9894a62c4b705e77e5feff98",
          "tp-boy=2608067cb74c4368b19e439d1f64809a307af9aeba5deee38ff81d1d9ade5022",
          "tp=58560e5173712d77920de86824d3a0ecf46238d909af4df15593c1479be6b906",
          "water.jpg=2ca8903494c6ae85beeedd303881f58d7112667dc9555a8d982561ccb7bd0844",
          "water=cfaa1a1ad365ec6e3b6dea3d06104d80d2eb75e9f36b9e66b4e6f8f169343724",
          "yupa-dance=040c81c00fa266d51090731d00aa568a9b86289ff8594ee0b450b6c6d06586f9",
          "zombie=9b90d03bea08ca90684529ac1ea3c6d2d10e2c985725e2081b0fcb031372ed42"
        ]
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
            "mov": [0, 0, 0],
            "gravity": [0, 0, 0],
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
      "fragmentShader": "precision mediump float;\n\nconst int NUM_TEXTURES = 16;\n\nuniform sampler2D uTextures[NUM_TEXTURES];\nvarying mediump vec2 vTexturePoint;\nvarying mediump float zDist;\nvarying mediump float light;\nvarying mediump vec3 vNormal;\nvarying mediump vec3 vFragPos;\nuniform vec4 uBackground;\nuniform vec3 uLightPos;\nuniform vec4 uLightIntensity;\nuniform vec3 uCamPosition;\n\nvec4 getTextureColor(sampler2D textures[NUM_TEXTURES], float textureSlot, vec2 vTexturePoint) {\n\tint textureInt = int(textureSlot);\n\tfor (int i = 0; i < NUM_TEXTURES; ++i) {\n\t\tif (textureInt == i) {\n\t\t\treturn texture2D(textures[i], vTexturePoint);\n\t\t}\n\t}\n\treturn texture2D(textures[0], vTexturePoint);\n}\n\nvec3 rgb2hsv(vec3 c) {\n    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n\n    float d = q.x - min(q.w, q.y);\n    float e = 1.0e-10;\n    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n}\n\nvec3 hsv2rgb(vec3 c) {\n    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\nvec4 alterHueSatLum(vec4 color, vec3 vHSV) {\n    vec3 fragRGB = color.rgb;\n    vec3 fragHSV = rgb2hsv(fragRGB).xyz;\n    fragHSV.x += vHSV.x;\n    fragHSV.yz *= vHSV.yz;\n    fragRGB = hsv2rgb(fragHSV);\n    return vec4(fragRGB, color.a);\n}\n\nvoid main(void) {\n\tvec3 normal = normalize(vNormal);\n\tvec3 lightDir = normalize(uLightPos - vFragPos.xyz);\n\tvec3 viewDir = normalize(uCamPosition-vFragPos);\n\tfloat ambient = uLightIntensity[0];\n\tfloat diffusion = uLightIntensity[1];\n\tfloat specular = uLightIntensity[2];\n\tfloat shininess = uLightIntensity[3];\n\n\tvec3 reflectDir = reflect(-lightDir, normal);  \n\n\tfloat diffLight = diffusion * max(dot(normal, lightDir), 0.0);\n\tfloat spec = specular * pow(max(dot(viewDir, reflectDir), 0.0), shininess);\n\n\tfloat textureSlot = floor(vTexturePoint.x);\n\tvec2 textureCoord = vec2(mod(vTexturePoint.x, 1.0), vTexturePoint.y);\n\tvec4 color = getTextureColor(uTextures, textureSlot, vTexturePoint);\n\n\tfloat limit = .5;\n    color.a = smoothstep(limit - .0001, limit + .0001, color.a);\n\n\tif (color.a <= 0.1) {\n\t\tdiscard;\n\t}\n\tcolor = alterHueSatLum(color, vec3(1.0, 1.0, min(1.2, max(0.0, .8 + zDist))));\n\tcolor = mix(vec4(color.rgb * (ambient + diffLight + spec), color.a), uBackground, zDist);\n\n\tgl_FragColor = color;\n}\n",
      "vertexShader": "precision mediump float;\n\nattribute vec3 aVertexPosition;\t\t\t//\t[ x, y, z ]\nattribute vec3 aOffset;\t\t\t\t\t//\t[ x, y, z ]\nattribute vec3 aNormal;\t\t\t\t\t//\t[ x, y, z ]\nattribute vec4 aVertexMove;\t\t\t\t//\t[ x, y, z, time ]\nattribute vec3 aVertexGravity;\t\t\t//\t[ x, y, z ]\n\nattribute float aType;\t\t\t\t\t//\twall/floor=0, sprite=1, water=2, ...\n\nattribute vec4 aVertexTextureCoord;\t\t//\t[ x, y, spritewidth, spriteheight ]\nattribute vec4 aAnimationData; \t\t\t//\t[ cols, start, total, frameRate ]\nattribute vec2 aGrid;\t\t\t\t\t//\t[ cols, rows ]\n\nuniform mat4 uProjectionMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uCameraRotation;\nuniform float uCurvature;\nuniform float uNow;\nuniform vec3 uLightPos;  \n\nvarying mediump vec2 vTexturePoint;\nvarying mediump float zDist;\nvarying mediump vec3 vNormal;\nvarying mediump vec3 vFragPos;\n\n\n\nvoid main(void) {\n\tfloat timeStart = aVertexMove.w;\n\tfloat time = uNow - timeStart;\n\tvec4 worldPos = vec4(aVertexPosition, 1.0);\n\tif (aType == 0.0) {\t//\tsprite face camera\n\t\tworldPos = uCameraRotation * worldPos;\n\t}\n\n\tworldPos.xyz += aOffset;\n\n\tif (aType == 7.0) {\t//\twater wave\n\t\tworldPos.y += sin((uNow * 0.05 + worldPos.x * 20.0 + worldPos.z * 50.0) * .2) * .05;\n\t}\n\n\tworldPos.xyz += aVertexMove.xyz * time;\n\tworldPos.xyz += aVertexGravity.xyz * time * time / 2.0;\n\n\tvec4 position = uProjectionMatrix * uViewMatrix * worldPos;\n\tposition.y -= uCurvature * (position.z * position.z + position.x * position.x) / 500.0;\n\n\tfloat cols = aGrid[0];\n\tfloat rows = aGrid[1];\n\tfloat frame = aAnimationData[0];\n\tfloat start = aAnimationData[1];\n\tfloat total = aAnimationData[2];\n\tfloat fps = aAnimationData[3];\n\tfloat index = start + mod(floor(frame + uNow * fps / 1000.0), total);\n\tfloat texCol = mod(index, cols);\n\tfloat texRow = floor(index / cols);\n\tvTexturePoint = aVertexTextureCoord.xy;\n\tvTexturePoint.x += texCol * aVertexTextureCoord[2];\n\tvTexturePoint.y += texRow * aVertexTextureCoord[3];\n\n\tzDist = min(1.0, (abs(position.z / 12.0) + abs(position.y / 10.0)) * .2);\n\tgl_Position = position;\n\tvFragPos = worldPos.xyz;\n\tvNormal = aNormal;\n}"
    }
  };
				
}