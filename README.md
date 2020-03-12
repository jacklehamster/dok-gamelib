# dok-gamelib
Dok game library.

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