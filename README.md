# Node Auto Deploy

一个使用 Nodejs Ts 结合 github webhook 的自动化部署程序, 支持多项目、自定义脚本、部署队列、日志记录、飞书群消息推送。支持自定义拓展

## 如何使用

1. 克隆项目

```sh
git clone https://github.com/baohangxing/node-auto-deploy
```

2. 修改基础配置

app.config.json 中配置 [飞书机器人密钥](https://www.feishu.cn/hc/zh-CN/articles/360024984973) 和 端口号

```json
{
  "feishuBot": "",
  "listenPort": 8009,
  "listenHost": "127.0.0.1"
}
```

在 deploy-list 和 shell 文件夹中配置自动化部署的项目以及自动化脚本
`projectDir` 为项目在服务器的位置
`githubFullName` 为项目的 github 的项目名, 支持多个
deploy-list 和 shell 文件夹中的文件名需要一致，不然会忽略

```json
{
  "projectDir": "/baohangxing/code/bhxya.com",
  "githubFullName": "baohangxing/bhxya.com",
  "description": "bhxya.com, blog"
}
```

服务开始后会将读取deploy-list下的所有的.json文件, 并找到对应的shell文件夹下的同名.sh作为部署脚本

**会将项目路径作为第一个参数 shell 脚本, 脚本可以通过路径完成各种自定义的操作**

3. 使用 [pm2](https://pm2.keymetrics.io/) 或其他守护进程管理器进行部署

4. 在 github 上配置项目的 webhook, 以及修改想要的触发条件，当前条件是 refs/heads/main 分支上的 push 操作

## 自定义拓展

项目的设计使用 hook 对自动化过程中的 **开始** **成功** **失败**进行各种自定配置
参考 app.js

对于所有任务的统一配置

```ts
const taskQueue = new TaskQueue();

taskQueue.init().then(() => {
  taskQueue.tasksAddErrorHook((task: { name: string }, error: string) => {
    Log.error(task.name, error);
  });
});
```

对于单一任务的特殊配置

```js
taskQueue.autoDeploy(queryData.repository.full_name, {
  beforeHooks: [
    function (task: { name: string }) {
      const text = `项目：${task.name}\n提交人：${queryData.head_commit.author.username}\n提交信息：${queryData.head_commit.message}\n开始部署...\n`;
      messagePush(text);
    },
  ],
  deploydHooks: [
    function (task: { name: string }, timeCost: number) {
      const text = `项目：${task.name}\n提交人：${queryData.head_commit.author.username}\n提交信息：${queryData.head_commit.message}\n状态：部署成功(${timeCost}s)\n`;
      messagePush(text);
    },
  ],
  errorHooks: [
    function (task: { name: string }, error: string) {
      const text = `项目：${task.name}\n提交人：${queryData.head_commit.author.username}\n提交信息：${queryData.head_commit.message}\n状态：部署错误(${error})\n`;
      messagePush(text);
    },
  ],
});
```

## End

人菜心大，不足之处多多指教。 嘤嘤嘤

MIT License

Copyright (c) 2022 H1mple

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
