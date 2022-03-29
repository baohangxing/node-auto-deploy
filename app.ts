import * as http from 'http';
import fileHandle from './src/fileHandle';
import messagePush from './utills/messagePush';
const App = fileHandle.readJsonSync('app.config.json');
import TaskQueue from './src/taskQueue';
import Log from './src/log';

const taskQueue = new TaskQueue();

taskQueue.init().then(() => {
  taskQueue.tasksAddErrorHook((task: { name: any }, error: any) => {
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
    let queryData: {
      ref: string;
      repository: { full_name: any };
      head_commit: { author: { username: any }; message: any };
    };
    try {
      queryData = JSON.parse(data);
    } catch {
      return res.end('格式错误');
    }
    try {
      if (queryData.ref === 'refs/heads/main' && queryData.repository && queryData.repository.full_name) {
        let isAddQueueFlag = taskQueue.autoDeploy(queryData.repository.full_name, {
          beforeHooks: [
            function (task: { name: any }) {
              const text = `项目：${task.name}\n提交人：${queryData.head_commit.author.username}\n提交信息：${queryData.head_commit.message}\n开始部署...\n`;
              messagePush(text);
            },
          ],
          deploydHooks: [
            function (task: { name: any }, timeCost: any) {
              const text = `项目：${task.name}\n提交人：${queryData.head_commit.author.username}\n提交信息：${queryData.head_commit.message}\n状态：部署成功(${timeCost}s)\n`;
              messagePush(text);
            },
          ],
          errorHooks: [
            function (task: { name: any }, error: any) {
              const text = `项目：${task.name}\n提交人：${queryData.head_commit.author.username}\n提交信息：${queryData.head_commit.message}\n状态：部署错误(${error})\n`;
              messagePush(text);
            },
          ],
        });
        res.end(isAddQueueFlag ? '部署任务加入队列' : '部署任务开始');
      } else {
        return res.end('格式错误');
      }
    } catch (error: any) {
      res.end(error.message + '\n\n' + error.stack);
    }
  });
});

server.listen(App.listenPort, App.listenHost);
console.log(`server run on http://${App.listenHost}:${App.listenPort} successful`);
