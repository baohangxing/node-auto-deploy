import * as http from 'http';
import fileHandle from '../src/fileHandle';
const APPConfig = fileHandle.readJsonSync(`${process.cwd()}/app.config.json`);

let options = {
  hostname: 'open.feishu.cn',
  port: 443,
  path: `/open-apis/bot/v2/hook/${APPConfig.feishuBot}`,
  method: 'POST',
  rejectUnauthorized: false,
  headers: {
    'Content-Type': 'application/json',
  },
};

function messagePush(messageText: string) {
  if (!APPConfig.feishuBot) return;

  let req = http.request(options, (res) => {
    res.setEncoding('utf8');
    res.on('data', (_chunk: any) => {
      // console.log('BODY: ' + chunk);
      // JSON.parse(chunk)
    });
  });

  req.on('error', () => {
    // console.log('problem with request: ' + e.message);
  });

  // write data to request body
  let post_data = {
    msg_type: 'text',
    content: {
      text: messageText,
    },
  };
  let content = JSON.stringify(post_data);
  req.write(content);

  req.end();
}

export default messagePush;
