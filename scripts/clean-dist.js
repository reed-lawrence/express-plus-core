const fs = require('fs-extra');

console.log('build.js: Removing output directory');
fs.rmdirSync('./dist', { recursive: true });