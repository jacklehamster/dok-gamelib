/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

function configCommunicator(communicator, engine) {
	const { sceneGL, sceneUI, domManager, logger, dataStore, mediaManager, newgrounds, glRenderer } = engine || {};

	communicator.register(
		{
			id: Commands.SCENE_BACKGROUND,
			parameters: "int",
			apply: color => sceneGL.setBackground(color),
		}, {
			id: Commands.SCENE_VIEW_POSITION,
			parameters: "float*6",
			apply: (...params) => sceneGL.setViewPosition(...params),
		}, {
			id: Commands.SCENE_VIEWANGLE,
			parameters: "float,float,float",
			apply: (...params) => sceneGL.setViewAngle(...params),
		}, {
			id: Commands.SCENE_CURVATURE,
			parameters: "float",
			apply: curvature => sceneGL.setCurvature(curvature),
		}, {
			id: Commands.SCENE_LIGHT,
			parameters: "float*7",
			apply: (...params) => sceneGL.setLight(...params),
		}, {
			id: Commands.SCENE_DEPTHEFFECT,
			parameters: "float,float,float",
			apply: (...params) => sceneGL.setDepthEffect(...params),
		}, {
			id: Commands.UI_CREATE_ELEMENT,
			parameters: "string,int,string,boolean",
			apply: (...params) => sceneUI.createElement(...params),
		}, {
			id: Commands.UI_SET_PARENT,
			parameters: "string,string",
			apply: (elementId, parent) => sceneUI.setParent(elementId, parent),
		}, {
			id: Commands.UI_SET_CLASS,
			parameters: "string,string",
			apply: (elementId, classList) => sceneUI.setClass(elementId, classList),
		}, {
			id: Commands.UI_SET_STYLE,
			parameters: "string,string,string",
			apply: (...params) => sceneUI.setStyle(...params),
		}, {
			id: Commands.UI_SET_TEXT,
			parameters: "string,string",
			apply: (elementId, text) => sceneUI.setText(elementId, text),
		}, {
			id: Commands.UI_SET_SIZE,
			parameters: "string,short,short",
			apply: (...params) => sceneUI.setSize(...params),
		}, {
			id: Commands.UI_SET_CANVAS,
			parameters: "string,object",
			apply: (...params) => sceneUI.setCanvas(...params),
		}, {
			id: Commands.UI_REMOVE_ELEMENT,
			parameters: "string",
			apply: elementId => sceneUI.removeElement(elementId),
		}, {
			id: Commands.ENG_NOTIFY_SCENE_CHANGE,
			parameters: "string",
			apply: name => engine.notifySceneChange(name),
		}, {
			id: Commands.VIEW_RESIZE,
			parameters: "short,short",
			apply: (width, height) => engine.resize(width, height),
		}, {
			id: Commands.DOM_BG_COLOR,
			parameters: "object",
			apply: color => domManager.setBackgroundColor(color),
		}, {
			id: Commands.LOGGER_LOG_MESSAGE,
			parameters: "array",
			apply: messages => logger.log(...messages),
		}, {
			id: Commands.DATA_SAVE,
			parameters: "object",
			apply: data => dataStore.sync(data),
		}, {
			id: Commands.MEDIA_PLAY_MUSIC,
			parameters: "string,boolean,string",
			apply: (...params) => mediaManager.playMusic(...params),
		}, {
			id: Commands.MEDIA_PAUSE_MUSIC,
			parameters: "string",
			apply: id => mediaManager.pauseMusic(id),
		}, {
			id: Commands.MEDIA_PLAY_VIDEO,
			parameters: "string,boolean,string",
			apply: (...params) => mediaManager.playVideo(...params),
		}, {
			id: Commands.MEDIA_PAUSE_VIDEO,
			parameters: "string",
			apply: id => mediaManager.pauseVideo(id),
		}, {
			id: Commands.MEDIA_SET_MUSIC_VOLUME,
			parameters: "string,float",
			apply: (id, volume) => mediaManager.setMusicVolume(id, volume),
		}, {
			id: Commands.NG_UNLOCK_MEDAL,
			parameters: "string",
			apply: medal => newgrounds.unlockMedal(medal).then(console.log).catch(console.error),
		}, {
			id: Commands.NG_POST_SCORE,
			parameters: "float",
			apply: medal => newgrounds.postScore(score).then(console.log).catch(console.error),
		}, {
			id: Commands.GL_SET_VISIBLE_CHUNKS,
			parameters: "uint",
			apply: count => glRenderer.setVisibleChunks(count),
		}, {
			id: Commands.GL_UPDATE_BUFFER,
			parameters: "byte,uint,dataView",
			apply: (bufferType, offset, dataView) => glRenderer.sendBufferToGL(bufferType, offset, dataView),
		}, {
			id: Commands.GL_UPDATE_BUFFER + BufferType.SPRITE_TYPE,
			parameters: "uint,[byte*4]",
			apply: (offset, dataView) => glRenderer.sendBufferToGL(BufferType.SPRITE_TYPE, offset, dataView),
			merge: true,
		}, {
			id: Commands.GL_UPDATE_BUFFER + BufferType.VERTEX,
			parameters: "uint,[float*24]",
			apply: (offset, dataView) => glRenderer.sendBufferToGL(BufferType.VERTEX, offset, dataView),
			merge: true,
		}, {
			id: Commands.GL_UPDATE_BUFFER + BufferType.OFFSET,
			parameters: "uint,[float*12]",
			apply: (offset, dataView) => glRenderer.sendBufferToGL(BufferType.OFFSET, offset, dataView),
			merge: true,
		}, {
			id: Commands.GL_UPDATE_BUFFER + BufferType.MOVE,
			parameters: "uint,[float*28]",
			apply: (offset, dataView) => glRenderer.sendBufferToGL(BufferType.MOVE, offset, dataView),
			merge: true,
		}, {
			id: Commands.GL_UPDATE_BUFFER + BufferType.TEXCOORD,
			parameters: "uint,[float*32]",
			apply: (offset, dataView) => glRenderer.sendBufferToGL(BufferType.TEXCOORD, offset, dataView),
			merge: true,
		}, {
			id: Commands.GL_UPDATE_BUFFER + BufferType.ANIMATION,
			parameters: "uint,[float*16]",
			apply: (offset, dataView) => glRenderer.sendBufferToGL(BufferType.ANIMATION, offset, dataView),
			merge: true,
		}, {
			id: Commands.GL_UPDATE_BUFFER + BufferType.GRID,
			parameters: "uint,[ushort*8]",
			apply: (offset, dataView) => glRenderer.sendBufferToGL(BufferType.GRID, offset, dataView),
			merge: true,
		}, {
			id: Commands.GL_UPDATE_BUFFER + BufferType.COLOR_EFFECT,
			parameters: "uint,[float*16]",
			apply: (offset, dataView) => glRenderer.sendBufferToGL(BufferType.COLOR_EFFECT, offset, dataView),
			merge: true,
		}, {
			id: Commands.GL_UPDATE_BUFFER + BufferType.BLACKHOLE_CENTER,
			parameters: "uint,[float*20]",
			apply: (offset, dataView) => glRenderer.sendBufferToGL(BufferType.BLACKHOLE_CENTER, offset, dataView),
			merge: true,
		}, {
			id: Commands.GL_UPDATE_BUFFER + BufferType.CHROMA_KEY,
			parameters: "uint,[float*16]",
			apply: (offset, dataView) => glRenderer.sendBufferToGL(BufferType.CHROMA_KEY, offset, dataView),
			merge: true,
		}
	);

	communicator.addEventListener("apply", () => {
		sceneGL.resetPools();
	});
}
