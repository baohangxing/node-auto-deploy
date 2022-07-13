import fileHandle from './fileHandle';
import Task from './task';
import * as path from 'path';
import { IAutoDeployHooks, IBeforeHookFn, IDeploydHookFn, IErrorHookFn } from '../type';

type DeployConfJson = {
  id: number;
  projectDir: string;
  githubFullName: string;
  description: string;
};

function checkDeployConfJson(v: any) {
  return (
    v !== undefined &&
    v.projectDir !== undefined &&
    v.githubFullName !== undefined &&
    v.description !== undefined &&
    v.id !== undefined
  );
}

class TaskQueue {
  _tasks: Array<Task> = [];
  _toDeployTasks: Array<Task> = [];
  _isExcuting: boolean = false;

  async init() {
    const taskFileNames = (await fileHandle.getDirFilePathList(path.join(process.cwd(), 'deploy-list')))
      .filter((x) => x.slice(x.length - 5) === '.json')
      .map((x) => x.replace(/\.json$/, ''));

    const tasks: Task[] = [];
    for (let taskName of taskFileNames) {
      const shellExist = await fileHandle.fileExists(path.join(process.cwd(), 'shell', taskName + '.sh'));
      if (shellExist) {
        try {
          const deployConf: DeployConfJson = fileHandle.readJsonSync(
            path.join(process.cwd(), 'deploy-list', taskName + '.json'),
          );
          if (checkDeployConfJson(deployConf)) {
            tasks.push(
              new Task(
                deployConf.id,
                taskName,
                deployConf.projectDir,
                deployConf.githubFullName,
                deployConf.description,
              ),
            );
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    this._tasks = tasks;
  }

  autoDeploy(githubFullName: string, hooks: IAutoDeployHooks) {
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

  tasksAddErrorHook(hook: IErrorHookFn) {
    for (let task of this._tasks) {
      task.addErrorHook(hook);
    }
  }

  tasksAddBeforeHook(hook: IBeforeHookFn) {
    for (let task of this._tasks) {
      task.addBeforeHook(hook);
    }
  }

  tasksAddSuccessHook(hook: IDeploydHookFn) {
    for (let task of this._tasks) {
      task.addDeloyHook(hook);
    }
  }
}

export default TaskQueue;
