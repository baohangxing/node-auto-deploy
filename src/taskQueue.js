const fileHandle = require('./fileHandle');
const Task = require('./task');
const path = require('path');

class TaskQueue {
    _tasks = [];
    _toDeployTasks = [];
    _isExcuting = false;

    constructor() {}

    async init() {
        let taskFileNames = (
            await fileHandle.getDirFilePathList(
                path.join(process.cwd(), 'deploy-list')
            )
        ).map(x => x.replace(/\.json$/, ''));

        let tasks = [];
        for (let taskName of taskFileNames) {
            let shellExist = await fileHandle.fileExists(
                path.join(process.cwd(), 'shell', taskName + '.sh')
            );
            if (shellExist) {
                let deployConf = fileHandle.readJsonSync(
                    path.join(process.cwd(), 'deploy-list', taskName + '.json')
                );
                tasks.push(
                    new Task(
                        deployConf.id,
                        taskName,
                        deployConf.projectDir,
                        deployConf.secret,
                        deployConf.description
                    )
                );
            }
        }
        this._tasks = tasks;
    }

    autoDeploy(secret) {
        let addQueueFlag = false;
        for (let task of this._tasks) {
            if (task.checkSecret(secret)) {
                if (this._isExcuting) {
                    this._toDeployTasks.push(task);
                    addQueueFlag = true;
                } else {
                    this._toDeployTasks.push(task);
                    this._loopDeply();
                }
            }
        }
        return addQueueFlag;
    }

    async _loopDeply() {
        let item = this._toDeployTasks[0];
        this._isExcuting = true;
        let { success } = await item.deploy();
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
