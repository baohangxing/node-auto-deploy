export interface IExecShellFileRes {
  shellResult: boolean;
  log: string;
}
export interface ITaskResult {
  success: boolean;
}

export type IHookFn<T> = (task: ITask, t: T) => void;
export type IBeforeHookFn = (task: ITask) => void;
export type IDeploydHookFn = IHookFn<number>;
export type IErrorHookFn = IHookFn<string>;

export interface IAutoDeployHooks {
  beforeHooks: Array<IBeforeHookFn>;
  deploydHooks: Array<IDeploydHookFn>;
  errorHooks: Array<IErrorHookFn>;
}

export interface ITask {
  id: number;
  name: string;
  githubFullName: string;
  projectDir: string;
  description: string;

  beforeHooks: Array<IBeforeHookFn>;
  deploydHooks: Array<IDeploydHookFn>;
  errorHooks: Array<IErrorHookFn>;

  copyTask: () => ITask;

  checkGithubFullName: (fullName: string) => boolean;
  addDeloyHook: (hook: IDeploydHookFn) => void;
  removeDeloyHook: (hook: IDeploydHookFn) => void;

  addBeforeHook: (hook: IBeforeHookFn) => void;
  removeBeforeHook: (hook: IBeforeHookFn) => void;

  addErrorHook: (hook: IErrorHookFn) => void;
  removeErrorHook: (hook: IErrorHookFn) => void;

  deploy: () => Promise<ITaskResult>;
}

export interface ILog {
  taskName: string;
  log: string;
  _handleSameId: number;
  _fileEndName: string;
}
