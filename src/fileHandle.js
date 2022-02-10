const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

class fileHandle {
  static fileExists(filepath) {
    return new Promise((resovle, reject) => {
      fs.access(filepath, fs.constants.F_OK, (err) => {
        err === null ? resovle(true) : resovle(false);
      });
    });
  }

  static readJsonSync(path) {
    const rawdata = fs.readFileSync(path);
    const res = JSON.parse(rawdata);
    return res;
  }

  static createFile(path, text) {
    fs.writeFile(path, text, (err, data) => {
      if (err) throw err;
    });
  }

  static getDirFilePathList(dirPath) {
    return new Promise((res, rej) => {
      fs.readdir(dirPath, (err, files) => {
        if (err) {
          console.error(err);
          res([]);
        } else {
          let list = [];
          for (let i = 0; i < files.length; i++) {
            if (fs.statSync(path.join(dirPath, files[i])).isFile()) {
              list.push(files[i]);
            }
          }
          res(list);
        }
      });
    });
  }

  static createFileHash256Sync(filePath) {
    const buffer = fs.readFileSync(filePath);
    const fsHash = crypto.createHash('sha256');

    fsHash.update(buffer);
    const md5 = fsHash.digest('hex');
    return md5;
  }
}

module.exports = fileHandle;
