const http = require('http');
const fileHandle = require('./src/fileHandle');
const messagePush = require('./utills/messagePush');
const App = fileHandle.readJsonSync('app.config.json');
const TaskQueue = require('./src/taskQueue');
const Log = require('./src/log');

const taskQueue = new TaskQueue();

taskQueue.init().then(res => {
    taskQueue.tasksAddErrorHook(function (task, error) {
        Log.error(task.name, error);
    });

    taskQueue.tasksAddErrorHook(function (task, error) {
        const text = `项目：${task.name}\n部署错误! ${error}`;
        messagePush(text);
    });

    taskQueue.tasksAddBeforeHook(function (task, timeCost) {
        const text = `项目：${task.name}\n开始部署。。。`;
        messagePush(text);
    });

    taskQueue.tasksAddSuccessHook(function (task, timeCost) {
        const text = `项目：${task.name}\n提交人：${1}\n提交信息：${1}\n环境：${
            App.env
        }\n状态：部署成功(${timeCost}s)\n`;
        messagePush(text);
    });
    console.log(taskQueue);
});

const server = http.createServer((req, res) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });

    req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        let queryData;
        try {
            queryData = JSON.parse(data);
        } catch {
            return res.end('格式错误');
        }
        try {
            console.log(queryData);
            let isAddQueueFlag = taskQueue.autoDeploy(
                'bhxya.com_1120_djedequ_bhx'
            );
            res.end(isAddQueueFlag ? '部署任务加入队列' : '部署任务开始');
        } catch (error) {
            res.end(error.message + '\n\n' + error.stack);
        }
    });
});

server.listen(App.listenPort, App.listenHost);
console.log(
    `server run on http://${App.listenHost}:${App.listenPort} successful`
);
