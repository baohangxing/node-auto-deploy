const callfile = require('child_process');

function execShellFile(shellpath, params = []) {
    return new Promise((resovle, reject) => {
        callfile.execFile(
            'sh',
            [shellpath, ...params],
            null,
            function (err, stdout, stderr) {
                if (err !== null) {
                    let errorFileName =
                        'NodeError:\n   ' +
                        err +
                        '\nStdError:\n   ' +
                        stderr +
                        '\nStdOut:\n   ' +
                        stdout;
                    resovle({ shellResult: false, log: errorFileName });
                } else {
                    resovle({ shellResult: true, log: '' });
                }
            }
        );
    });
}

module.exports = execShellFile;
