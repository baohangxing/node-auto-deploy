import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';

class fileHandle {
  static fileExists(filepath: fs.PathLike): Promise<boolean> {
    return new Promise((resovle, reject) => {
      fs.access(filepath, fs.constants.F_OK, (err) => {
        err === null ? resovle(true) : resovle(false);
      });
    });
  }

  static readJsonSync(path: fs.PathOrFileDescriptor) {
    const rawdata: Buffer = fs.readFileSync(path);
    const res = JSON.parse(rawdata.toString());
    return res;
  }

  static createFile(path: fs.PathOrFileDescriptor, text: string) {
    fs.writeFile(path, text, (err) => {
      if (err) throw err;
    });
  }

  static getDirFilePathList(dirPath: fs.PathLike): Promise<Array<string>> {
    return new Promise((res, rej) => {
      fs.readdir(dirPath, (err, files) => {
        if (err) {
          console.error(err);
          res([]);
        } else {
          let list = [];
          for (let i = 0; i < files.length; i++) {
            if (fs.statSync(path.join(dirPath.toString(), files[i])).isFile()) {
              list.push(files[i]);
            }
          }
          res(list);
        }
      });
    });
  }

  static createFileHash256Sync(filePath: fs.PathOrFileDescriptor): string {
    const buffer = fs.readFileSync(filePath);
    const fsHash = crypto.createHash('sha256');

    fsHash.update(buffer);
    const md5 = fsHash.digest('hex');
    return md5;
  }
}

export default fileHandle;
