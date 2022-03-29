import * as callfile from 'child_process';

function execShellFile(shellpath: string, params = []) {
  return new Promise((resovle, reject) => {
    callfile.execFile('sh', [shellpath, ...params], null, (err, stdout, stderr) => {
      if (err !== null) {
        let errorFileName = 'NodeError:\n   ' + err + '\nStdError:\n   ' + stderr + '\nStdOut:\n   ' + stdout;
        resovle({ shellResult: false, log: errorFileName });
      } else {
        resovle({ shellResult: true, log: '' });
      }
    });
  });
}

export default execShellFile;
