# dok-gamelib
Dok game library.

![Create Release](https://github.com/jacklehamster/dok-gamelib/workflows/Create%20Release/badge.svg)
![gh-pages](https://github.com/jacklehamster/dok-gamelib/workflows/github%20pages/badge.svg)



To build a game, add files to game folder:
- config.json
Set basic information such as:
	- title
	- description

- assets
Add images to assets folder. Those will be combined into a single spritesheet.

- scenes
Add js files to the scenes folder.
```
SceneManager.add(Class, config);

Class: Pass a javascript class as the first parameter, extending the Game class. That class will be instantiated as new Class().

config: The config will get processed and assigned to the class. For the schema of config, see schema.json

``` 

Documentation in progress. Meanwhile, check out the sample projects:
https://jacklehamster.github.io/dok-gamelib

![Demo Image](https://github.com/jacklehamster/dok-gamelib/raw/master/img/demo.png)

- For each scene, you can see the code by clicking EDITOR
- The code shown is all the code needed to produce a scene (excluding the code for the engine itself).

## Scene file structure

```
game
├── game.json
│   scenes
│   ├── <scene-name>
│   |   ├── start.js
│   │   ├── assets
│   |   │   ├── *.png
│   |   │   ├── *.jpg
```
## Deploy

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/jacklehamster/dok-gamelib)

Game produced: https://jacklehamster.github.io/dok-gamelib/archive/game.zip
