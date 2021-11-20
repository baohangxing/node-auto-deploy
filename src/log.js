const fileHandle = require('./fileHandle');
const path = require('path');

function createLogName(taskName = '') {
    let data = new Date();

    let name = `${data.getFullYear()}-${
        data.getMonth() + 1
    }-${data.getDate()}-${data.getHours()}_${
        data.getMinutes() <= 9 ? '0' + data.getMinutes() : data.getMinutes()
    }.`;
    name += taskName;

    return name;
}

class Log {
    /**
     *
     * @param {*} taskName 任务名称
     * @param {*} log 日志内容
     */
    static log(
        taskName = '',
        log = '',
        _handleSameId = 0,
        _fileEndName = '.log'
    ) {
        let fileName =
            createLogName(taskName) +
            (_handleSameId === 0 ? '' : `.${_handleSameId}`) +
            _fileEndName;
        let filePath = path.join(process.cwd(), 'logs', fileName);
        fileHandle.fileExists(filePath).then(res => {
            if (!res) {
                fileHandle.createFile(filePath, log);
            } else {
                if (_handleSameId > 10) return;
                this.log(taskName, log, _handleSameId + 1, _fileEndName);
            }
        });
    }

    /**
     *
     * @param {*} taskName 任务名称
     * @param {*} log 日志内容
     */
    static error(taskName = '', log = '') {
        this.log(taskName, log, 0, '.errorLog');
    }
}

module.exports = Log;
