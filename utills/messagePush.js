var http = require('https');
const APPConfig = fileHandle.readJsonSync(`${process.cwd()}/app.config.json`);

var options = {
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
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            //console.log('BODY: ' + chunk);
            //JSON.parse(chunk)
        });
    });

    req.on('error', function (e) {
        //console.log('problem with request: ' + e.message);
    });

    // write data to request body
    var post_data = {
        msg_type: 'text',
        content: {
            text: messageText,
        },
    };
    var content = JSON.stringify(post_data);
    req.write(content);

    req.end();
}

module.exports = messagePush;
