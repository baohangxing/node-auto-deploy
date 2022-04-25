import fileHandle from './fileHandle';
import * as path from 'path';
import { ILog } from '../type';

function createLogName(taskName: string = ''): string {
  let data: Date = new Date();

  let name = `${data.getFullYear()}-${data.getMonth() + 1}-${data.getDate()}-${data.getHours()}_${
    data.getMinutes() <= 9 ? '0' + data.getMinutes() : data.getMinutes()
  }.`;
  name += taskName;

  return name;
}

class Log {
  /**
   * @param {*} taskName 任务名称
   */
  static log({ taskName = '', log = '', _handleSameId = 0, _fileEndName = '.log' }: ILog): void {
    let fileName = createLogName(taskName) + (_handleSameId === 0 ? '' : `.${_handleSameId}`) + _fileEndName;
    let filePath = path.join(process.cwd(), 'logs', fileName);
    fileHandle.fileExists(filePath).then((res) => {
      if (!res) {
        fileHandle.createFile(filePath, log);
      } else {
        if (_handleSameId > 10) return;
        this.log({
          taskName: taskName,
          log: log,
          _handleSameId: _handleSameId + 1,
          _fileEndName: _fileEndName,
        });
      }
    });
  }

  /**
   *
   * @param {*} taskName 任务名称
   * @param {*} log 日志内容
   */
  static error(taskName: string = '', log: string = '') {
    this.log({
      taskName: taskName,
      log: log,
      _handleSameId: 0,
      _fileEndName: '.errorLog',
    });
  }
}

export default Log;
