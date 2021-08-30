const http = require('http');
const fileHandle = require('./utills/fileHandle');
const execShellFile = require('./utills/execShell');
const messagePush = require('./utills/messagePush');
const createMessage = require('./utills/messageTpl.js');
const App = fileHandle.readJsonSync('app.config.json');

global.TaskQueue = []; //任务队列
global.Excuting = false; //正在执行

//当前任务
global.ProjectInfo = {
    project: '',
    commitUser: '',
    commitMessage: '',
};

setInterval(queryShellTask, 2000);

function queryShellTask() {
    if (TaskQueue.length > 0 && Excuting === false) {
        Excuting = true;
        const taskInfo = TaskQueue[TaskQueue.length - 1];
        ProjectInfo = taskInfo.ProjectInfo;
        pushMessage('正在部署。。。', ProjectInfo);
        var start_ts = new Date().getTime();
        execShellFile(taskInfo.shellPath, taskInfo.shellParams).then(res => {
            TaskQueue.pop();
            Excuting = false;
            var spend = Math.ceil((new Date().getTime() - start_ts) / 1000);
            pushMessage(
                res.shellResult === true
                    ? `部署成功(${spend}s)`
                    : `错误! ${res.log}`,
                ProjectInfo
            );
        });
    }
}

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });

    req.on('data', async chunk => {
        try {
            const data = JSON.parse(decodeURIComponent(chunk));

            if (validDeploySecret(data) === false) {
                return res.end('code: 401\n 没有部署权限');
            }

            if (validDeployRequest(data) === false) {
                return res.end('code: 5002\n 没有要执行的部署任务');
            }

            // 根据name读取项目部署配置
            const name = data.repository.name;
            const deployConf = fileHandle.readJsonSync(
                `${process.cwd()}/deploy-list/${name}.json`
            );

            const shellPath = `${process.cwd()}/shell/${name}.sh`;

            const info = {
                project: `${data.repository.name}(${data.repository.description})`,
                commitUser: data.head_commit.author.name,
                commitMessage: data.head_commit.message,
            };
            // 队列为空，立即执行任务
            if (TaskQueue.length === 0 && Excuting === false) {
                Excuting = true;
                ProjectInfo = info;
                pushMessage('正在部署。。。', info);
                var start = new Date().getTime();
                execShellFile(shellPath, [deployConf.projectDir]).then(res => {
                    Excuting = false;
                    var spends = Math.ceil(
                        (new Date().getTime() - start) / 1000
                    );
                    pushMessage(
                        res.shellResult === true
                            ? `部署成功(${spends}s)`
                            : `错误! ${res.log}`,
                        info
                    );
                });
            } else {
                TaskQueue.unshift({
                    shellPath: shellPath,
                    shellParams: [deployConf.projectDir],
                    ProjectInfo: info,
                });
                pushMessage('排队中。。。', info);
            }
            res.end('code: 200\n部署任务已提交');
        } catch (error) {
            res.end(error.stack);
        }
    });
}).listen(App.listenPort, App.listenHost);

// 触发部署的条件
function validDeployRequest(data) {
    return data.ref === 'refs/heads/main';
}

//验证secret
function validDeploySecret(data) {
    //TODO return data.hook.config.secret === App.secret;
    return true;
}

function pushMessage(text, projectInfo) {
    const msg = createMessage({
        env: App.env,
        statusText: text,
        ...projectInfo,
    });
    messagePush(msg);
}
