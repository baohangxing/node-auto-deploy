import execShellFile from './../utills/execShell';
import * as path from 'path';
import { ITask, IBeforeHookFn, IDeploydHookFn, IErrorHookFn, ITaskResult, IExecShellFileRes } from './../type/index';

class Task implements ITask {
  id: number;
  name: string;
  githubFullName: string;
  projectDir: string;
  description: string;

  beforeHooks: Array<IBeforeHookFn>;
  deploydHooks: Array<IDeploydHookFn>;
  errorHooks: Array<IErrorHookFn>;

  constructor(id: number, name: string, projectDir: string, githubFullName: string, description: string = '') {
    this.id = id;
    this.name = name;
    this.projectDir = projectDir;
    this.githubFullName = githubFullName;
    this.description = description;
    this.beforeHooks = [];
    this.deploydHooks = [];
    this.errorHooks = [];
  }

  copyTask(): Task {
    let task = new Task(this.id, this.name, this.projectDir, this.githubFullName, this.description);
    for (let hook of this.beforeHooks) {
      task.addBeforeHook(hook);
    }
    for (let hook of this.deploydHooks) {
      task.addDeloyHook(hook);
    }
    for (let hook of this.errorHooks) {
      task.addErrorHook(hook);
    }
    return task;
  }

  checkGithubFullName(fullName: string) {
    return fullName === this.githubFullName;
  }

  addDeloyHook(hook: IDeploydHookFn) {
    if (typeof hook === 'function') this.deploydHooks.push(hook);
  }

  removeDeloyHook(hook: IDeploydHookFn) {
    for (let i = this.deploydHooks.length; i >= 0; i--) {
      if (this.deploydHooks[i] === hook) {
        this.deploydHooks.splice(i, 1);
      }
    }
  }

  addErrorHook(hook: IErrorHookFn) {
    if (typeof hook === 'function') this.errorHooks.push(hook);
  }

  removeErrorHook(hook: IErrorHookFn) {
    for (let i = this.errorHooks.length; i >= 0; i--) {
      if (this.errorHooks[i] === hook) {
        this.errorHooks.splice(i, 1);
      }
    }
  }

  addBeforeHook(hook: IBeforeHookFn) {
    if (typeof hook === 'function') this.beforeHooks.push(hook);
  }

  removeBeforeHook(hook: IBeforeHookFn) {
    for (let i = this.beforeHooks.length; i >= 0; i--) {
      if (this.beforeHooks[i] === hook) {
        this.beforeHooks.splice(i, 1);
      }
    }
  }
  async deploy(): Promise<ITaskResult> {
    let shellPath = path.join(process.cwd(), 'shell', this.name + '.sh');
    for (let hook of this.beforeHooks) {
      await hook(this);
    }
    let start_ts = new Date().getTime();
    let res: IExecShellFileRes = (await execShellFile(shellPath, [this.projectDir as never])) as IExecShellFileRes;
    let timeCost = Math.ceil((new Date().getTime() - start_ts) / 1000);
    if (!res.shellResult) {
      for (let hook of this.errorHooks) {
        await hook(this, res.log);
      }
      return {
        success: false,
      };
    } else {
      for (let hook of this.deploydHooks) {
        await hook(this, timeCost);
      }
      return {
        success: true,
      };
    }
  }
}

export default Task;
