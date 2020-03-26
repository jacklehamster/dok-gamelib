const fs = require('fs');
const mustache = require('mustache');
const path = require('path');
const readdirRecursive = require('fs-readdir-recursive');


const templateDirectory = `${__dirname}/../template`;

function renderTemplateFromFile(template, filePath, extraObjects) {
	return new Promise((resolve, reject) => {
		Promise.all([
			fs.promises.readFile(path.join(templateDirectory, `${template}.mustache`), "utf8"),
			fs.promises.readFile(filePath, "utf8"),
		]).then(([page, response]) => {
			const obj = JSON.parse(response);
			Object.assign(obj, extraObjects);
			resolve(mustache.render(page, { obj, json: JSON.stringify(obj) } ));
		});
	});
}

function renderTemplate(template, object) {
	return new Promise((resolve, reject) => {
		fs.promises.readFile(path.join(templateDirectory, `${template}.mustache`), "utf8")
			.then(page => {
				resolve(mustache.render(page, object));
			});
	});
}

function getFromFiles(filePaths) {
	return new Promise((resolve, reject) => {
		Promise.all(filePaths.map(filePath => fs.promises.readFile(filePath, 'utf8'))).then(resolve);
	});
}

function getFolderAsData(dir, includeDir) {
	return new Promise((resolve, reject) => {
		const items = readdirRecursive(dir);
		resolve(includeDir ? items.map(name => `${dir}${name}`) : items);
	});
}

module.exports = {
  renderTemplateFromFile,
  renderTemplate,
  getFromFiles,
  getFolderAsData,
};