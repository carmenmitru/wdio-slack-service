const { IncomingWebhook } = require("@slack/webhook");
const failedColor = "#dc3545";
class SlackService {
    constructor(config) {
        this.config = config;

        this.failedTests = 0;
        this.tests = 0;
        if (!this.config.webhook) {
          console.error(
            "[slack-reporter] Slack Webhook URL is not configured, notifications will not be sent to slack."
          );
          return;
        }
    
        this.webhook = new IncomingWebhook(this.config.webhook);
        this.message = this.config.message || "WebdriverIO Slack Reporter";
        this.attachments = [
          {
            pretext: `*${this.message} *`,
            title: "",
          },
        ];
    }

     afterTest(test, context, results) {
        this.tests++;

        const { error, passed } = results;
    
        let testError = error.matcherResult
          .message()
          .replace(
            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
            ""
          );
    
    
        let attach = {
          color: failedColor,
          author_name: test.fullName || `${test.parent} - ${test.title}`,
          footer: testError.toString(),
          footer_icon: "https://img.icons8.com/color/48/000000/info--v1.png",
          ts: Date.now(),
        };
        if (!passed) {
           this.failedTests++;
           this.attachments.push(attach);
        }
    }

    async after() {
        if (this.config.notifyOnlyOnFailure === true) {
            this.attachments[0].title += `Total tests: ${
              this.tests
            } \n Total passed: ${this.tests - this.failedTests} \n Total failed: ${
              this.failedTests
            }`;

      
            await this.webhook.send({
              attachments: this.attachments,
            });
        }
       
    }
}

module.exports = SlackService;
