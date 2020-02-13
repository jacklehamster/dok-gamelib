const fs = require('fs');
const mustache = require('mustache');
const path = require('path');
const readdirRecursive = require('fs-readdir-recursive');


const templateDirectory = `${__dirname}/../template`;

function renderTemplateFromFile(template, filePath) {
	return new Promise((resolve, reject) => {
		Promise.all([
			fs.promises.readFile(path.join(templateDirectory, `${template}.mustache`), "utf8"),
			fs.promises.readFile(filePath, "utf8"),
		]).then(([page, response]) => {
			resolve(mustache.render(page, JSON.parse(response)));
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

function getFolderAsData(dir) {
	return new Promise((resolve, reject) => {
		const items = readdirRecursive(dir);
		resolve(items);
	});
}

module.exports = {
  renderTemplateFromFile,
  renderTemplate,
  getFromFiles,
  getFolderAsData,
};