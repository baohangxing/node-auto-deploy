let http = require('https');
const fileHandle = require('../src/fileHandle');
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

function messagePush(messageText) {
  if (!APPConfig.feishuBot) return;

  let req = http.request(options, (res) => {
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      // console.log('BODY: ' + chunk);
      // JSON.parse(chunk)
    });
  });

  req.on('error', (e) => {
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

module.exports = messagePush;
