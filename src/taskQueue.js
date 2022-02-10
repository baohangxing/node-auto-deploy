const fileHandle = require('./fileHandle');
const Task = require('./task');
const path = require('path');

class TaskQueue {
  _tasks = [];
  _toDeployTasks = [];
  _isExcuting = false;

  async init() {
    let taskFileNames = (await fileHandle.getDirFilePathList(path.join(process.cwd(), 'deploy-list'))).map((x) =>
      x.replace(/\.json$/, ''),
    );

    let tasks = [];
    for (let taskName of taskFileNames) {
      let shellExist = await fileHandle.fileExists(path.join(process.cwd(), 'shell', taskName + '.sh'));
      if (shellExist) {
        let deployConf = fileHandle.readJsonSync(path.join(process.cwd(), 'deploy-list', taskName + '.json'));
        tasks.push(
          new Task(deployConf.id, taskName, deployConf.projectDir, deployConf.githubFullName, deployConf.description),
        );
      }
    }
    this._tasks = tasks;
  }

  autoDeploy(githubFullName, hooks = {}) {
    let addQueueFlag = false;
    for (let task of this._tasks) {
      if (task.checkGithubFullName(githubFullName)) {
        let newTask = task.copyTask();
        if (hooks.beforeHooks && hooks.beforeHooks.length) {
          for (let hook of hooks.beforeHooks) {
            newTask.addBeforeHook(hook);
          }
        }
        if (hooks.deploydHooks && hooks.deploydHooks.length) {
          for (let hook of hooks.deploydHooks) {
            newTask.addDeloyHook(hook);
          }
        }
        if (hooks.errorHooks && hooks.errorHooks.length) {
          for (let hook of hooks.errorHooks) {
            newTask.addErrorHook(hook);
          }
        }
        if (this._isExcuting) {
          this._toDeployTasks.push(newTask);
          addQueueFlag = true;
        } else {
          this._toDeployTasks.push(newTask);
          this._loopDeply();
        }
      }
    }
    return addQueueFlag;
  }

  async _loopDeply() {
    let item = this._toDeployTasks[0];
    this._isExcuting = true;
    await item.deploy();
    this._toDeployTasks.shift();
    if (this._toDeployTasks.length === 0) {
      this._isExcuting = false;
    } else {
      this._loopDeply();
    }
  }

  tasksAddErrorHook(hook) {
    for (let task of this._tasks) {
      task.addErrorHook(hook);
    }
  }

  tasksAddBeforeHook(hook) {
    for (let task of this._tasks) {
      task.addBeforeHook(hook);
    }
  }

  tasksAddSuccessHook(hook) {
    for (let task of this._tasks) {
      task.addDeloyHook(hook);
    }
  }
}

module.exports = TaskQueue;
