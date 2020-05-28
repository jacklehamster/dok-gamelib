/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

function configCommunicator(communicator, { sceneGL, sceneUI }) {
	communicator.register(
		{
			id: Commands.SCENE_BACKGROUND,
			parameters: "int",
			apply: color => sceneGL.setBackground(color),
		}, {
			id: Commands.SCENE_VIEW_POSITION,
			parameters: "float,float,float,float,float,float",
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
			parameters: "float,float,float,float,float,float,float",
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
		}
	);
}
