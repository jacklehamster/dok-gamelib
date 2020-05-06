/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
 *	SceneGLRenderer
 */

class SceneGLRenderer {
	constructor(canvas, gl, shader) {
		this.gl = gl;
		this.shader = shader;
		this.canvas = canvas;
		this.projectionMatrix = mat4.create();
		this.viewMatrix = mat4.create();
		this.pool = {
			vec3: new Pool(vec3.create, Utils.clear3),
			quat: new Pool(quat.create, quat.identity),
			mat4: new Pool(mat4.create, mat4.identity),
		};
	}

	setBackground(color) {
		const { gl, shader, canvas } = this;
		color = color || 0;
		const a = 1 - ((color >> 24) % 256) / 255;
		const r = ((color >> 16) % 256) / 255;
		const g = ((color >> 8) % 256) / 255;
		const b = ((color) % 256) / 255;
		gl.uniform4f(shader.programInfo.background, r, g, b, a);
		gl.clearColor(r, g, b, 1.0);
		canvas.style.backgroundColor = Utils.getDOMColor(color);
	}

	setViewAngle(viewAngle, near, far) {
		if (near <= 0) {
			console.error(`Invalid range [near, far]. Near needs to be higher than 0.`);
		}
		const { gl, shader, projectionMatrix } = this;
		const fieldOfView = (viewAngle||45) * Math.PI / 180;   // in radians
		const aspect = gl.canvas.width / gl.canvas.height;
		mat4.perspective(projectionMatrix, fieldOfView, aspect, near, far);
		gl.uniformMatrix4fv(shader.programInfo.projection, false, projectionMatrix);
	}

	setViewPosition(x, y, z, tilt, turn, cameraDistance) {
		const { gl, shader, viewMatrix, pool } = this;
		const scale = 1;
		const zOffset = cameraDistance;	//	camera distance
		const cameraQuat = pool.quat.get();
		const cameraRotationMatrix = pool.mat4.get();
		quat.rotateY(cameraQuat, quat.rotateX(cameraQuat, IDENTITY_QUAT, tilt), turn);
		mat4.fromRotationTranslationScaleOrigin(viewMatrix, cameraQuat, ZERO_VEC3,
			Utils.set3(pool.vec3.get(), scale, scale, scale),
			Utils.set3(pool.vec3.get(), 0, -tilt * 2, zOffset));
		quat.conjugate(cameraQuat, cameraQuat);	//	conjugate for sprites			
		mat4.translate(viewMatrix, viewMatrix, Utils.set3(pool.vec3.get(), -x, -y, -z + zOffset));

		mat4.fromQuat(cameraRotationMatrix, cameraQuat);
		gl.uniformMatrix4fv(shader.programInfo.view, false, viewMatrix);
		gl.uniformMatrix4fv(shader.programInfo.camRotation, false, cameraRotationMatrix);
		gl.uniform3f(shader.programInfo.camPosition, x, y, z - zOffset);
	}

	setCurvature(curvature) {
		const { gl, shader } = this;
		gl.uniform1f(shader.programInfo.curvature, curvature);
	}

	setLight(position, ambient, diffusionStrength, specularStrength, shininess) {
		const { gl, shader } = this;

		gl.uniform4f(shader.programInfo.lightIntensity, ambient, diffusionStrength, specularStrength, shininess);
		gl.uniform3fv(shader.programInfo.lightPosition, position);
	}

	setDepthEffect(fading, closeSaturation, farSaturation) {
		const { gl, shader } = this;
		gl.uniform4f(shader.programInfo.depthEffect, fading, 0, closeSaturation, farSaturation);
	}	

	resetPools() {
		for (let p in this.pool) {
			this.pool[p].reset();
		}
	}
}