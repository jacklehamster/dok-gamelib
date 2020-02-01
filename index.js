const express = require('express');
const path = require('path');
const fs = require('fs');
const mustache = require('mustache');
const assets = require('./lib/assets');

const app = express();
const port = 8000;

app.get('/', function (req, res) {
	const page = fs.readFileSync(path.join(__dirname + '/template/index.mustache'), "utf8");
	const config = JSON.parse(fs.readFileSync(path.join(__dirname + '/game/config.json')));
	const html = mustache.render(page, config);

	res.send(html);
	fs.writeFile('public/index.html', html, (err) => {
	    if (err) throw err;
	    console.log('HTML saved!');
	});
});

app.get('/spritesheet', function(req, res) {
	const assetDirectory = `${__dirname}/game/assets/`;

	assets.produceSpritesheets(assetDirectory, 1000, 1000).then(({spritesheets, data}) => {
		res.writeHeader(200, {"Content-Type": "text/html"});  
		data.spritesheets.forEach(src => {
	        res.write(`<img style='background-color: #ddddee; border: 1px solid black' src="${src}" width=200 height=200>`);  
		});
		res.write(`<pre>${JSON.stringify(data, null, '\t')}</pre>`);
		res.end();
	});
});

app.use(express.static('public'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));