// 自定义消息模板
function createMessage(params) {
    const text = `项目：${params.project}\n提交人：${params.commitUser}\n提交信息：${params.commitMessage}\n环境：${params.env}\n状态：${params.statusText}\n`;
    return text;
}

module.exports = createMessage;
