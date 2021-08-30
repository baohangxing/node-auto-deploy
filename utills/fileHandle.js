const fs = require('fs');
const crypto = require('crypto');

class fileHandle {
    static fileExists(filepath) {
        return new Promise((resovle, reject) => {
            fs.access(filepath, fs.constants.F_OK, err => {
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

    static createFileHash256Sync(filePath) {
        const buffer = fs.readFileSync(filePath);
        const fsHash = crypto.createHash('sha256');

        fsHash.update(buffer);
        const md5 = fsHash.digest('hex');
        return md5;
    }
}

module.exports = fileHandle;
