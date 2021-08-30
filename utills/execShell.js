require('./datePrototype');
const callfile = require('child_process');
const fileHandle = require('./fileHandle');
const APPConfig = fileHandle.readJsonSync(`${process.cwd()}/app.config.json`);

function execShellFile(shellpath, params = []) {
    return new Promise((resovle, reject) => {
        callfile.execFile(
            'sh',
            [shellpath, ...params],
            null,
            function (err, stdout, stderr) {
                const ts = new Date().Format('yyyyMMddhhmmss');
                if (err !== null) {
                    let errorFileName = `${process.cwd()}/logs/${ts}.error.log`;
                    fileHandle.createFile(
                        errorFileName,
                        '\nNodeError:\n' +
                            err +
                            '\nStdError:\n' +
                            stderr +
                            '\nStdOut:\n' +
                            stdout
                    );
                    resovle({ shellResult: false, log: errorFileName });
                } else {
                    let fileName = `${process.cwd()}/logs/${ts}.log`;
                    fileHandle.createFile(fileName, stdout);
                    resovle({ shellResult: true, log: fileName });
                }
            }
        );
    });
}

module.exports = execShellFile;
