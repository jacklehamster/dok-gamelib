/**
  Dok-gamelib engine

  Description: Game engine for producing web games easily using JavaScript and WebGL
  Author: jacklehamster
  Sourcode: https://github.com/jacklehamster/dok-gamelib
  Year: 2020
 */


const fs = require('fs');
const archiver = require('archiver');

function zipDirectory(directory, filename) {
  const archive = archiver('zip', { zlib: { level: 9 }});
  const stream = fs.createWriteStream(filename);

  return new Promise((resolve, reject) => {
    archive
      .directory(directory, false)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
}


module.exports = {
  zipDirectory,
};