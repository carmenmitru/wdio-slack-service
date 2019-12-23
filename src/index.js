const { IncomingWebhook } = require("@slack/webhook");
const failedColor = "#E51670";
class SlackService {
    constructor(config) {
        this.config = config;
        if (!this.config.webhook) {
            console.error(
                "[slack-reporter] Slack Webhook URL is not configured, notifications will not be sent to slack."
            );
            return;
        }
        this.webhook = new IncomingWebhook(this.config.webhook);
        this.message = this.config.message;
        this.attachments = [];
    }

    afterTest(test) {
        if (test.passed === false) {
            let attach = {
                color: failedColor,
                author_name: test.fullTitle,
                footer: test.error.stack
            };
            this.attachments.push(attach);
        }
    }

    async after() {
        await this.webhook.send({
            attachments: this.attachments
        });
    }
}

module.exports = SlackService;
