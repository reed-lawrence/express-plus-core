var fs = require('fs');

function deleteFolderRecursive(path) {
  if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + "/" + file;

      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });

    // console.log(`Deleting directory "${path}"...`);
    fs.rmdirSync(path);
  }
};

function copyAssets(files, to){
  console.log('copying assets');
  if(!fs.existsSync(to)){
    fs.mkdirSync(to);
  }

  if(fs.existsSync(to) && fs.lstatSync(to).isDirectory()){
    for(const file of files){
      fs.copyFileSync(file, to);
    }
  }
}

console.log('build.js: Removing output directory');
deleteFolderRecursive('./dist');
// copyAssets(['./server/.env'], './dist');