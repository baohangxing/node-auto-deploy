const http = require('http');
const fileHandle = require('./src/fileHandle');
const messagePush = require('./utills/messagePush');
const App = fileHandle.readJsonSync('app.config.json');
const TaskQueue = require('./src/taskQueue');
const Log = require('./src/log');

const taskQueue = new TaskQueue();

taskQueue.init().then(() => {
  taskQueue.tasksAddErrorHook((task, error) => {
    Log.error(task.name, error);
  });
});

const server = http.createServer((req, res) => {
  let data = '';
  req.on('data', (chunk) => {
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
      if (queryData.ref === 'refs/heads/main' && queryData.repository && queryData.repository.full_name) {
        let isAddQueueFlag = taskQueue.autoDeploy(queryData.repository.full_name, {
          beforeHooks: [
            function (task) {
              const text = `项目：${task.name}\n提交人：${queryData.head_commit.author.username}\n提交信息：${queryData.head_commit.message}\n开始部署...\n`;
              messagePush(text);
            },
          ],
          deploydHooks: [
            function (task, timeCost) {
              const text = `项目：${task.name}\n提交人：${queryData.head_commit.author.username}\n提交信息：${queryData.head_commit.message}\n状态：部署成功(${timeCost}s)\n`;
              messagePush(text);
            },
          ],
          errorHooks: [
            function (task, error) {
              const text = `项目：${task.name}\n提交人：${queryData.head_commit.author.username}\n提交信息：${queryData.head_commit.message}\n状态：部署错误(${error})\n`;
              messagePush(text);
            },
          ],
        });
        res.end(isAddQueueFlag ? '部署任务加入队列' : '部署任务开始');
      } else {
        return res.end('格式错误');
      }
    } catch (error) {
      res.end(error.message + '\n\n' + error.stack);
    }
  });
});

server.listen(App.listenPort, App.listenHost);
console.log(`server run on http://${App.listenHost}:${App.listenPort} successful`);
