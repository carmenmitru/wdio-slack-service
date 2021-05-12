const { IncomingWebhook } = require(`@slack/webhook`);
const { failedAttachment, passedAttachment } = require(`./util`);

class SlackService {

    constructor(options) {
        this.options = options;
        this.webhook = this.options.webHookUrl 
                        ? new IncomingWebhook(this.options.webHookUrl) 
                        : (function() { 
                            console.error(`[slack-error]: Slack webhook URL is not defined`);
                            return;
                        })();
        this.failedTests = 0;
        this.passedTests = 0;
        this.tests = 0;
        this.testNameFull = ``;
        this.attachment = [{
            pretext: `*${this.options.messageTitle || `Webdriverio Slack Reporter`}*`,
            title: "",
        }];
        this.testTitle = ``;
    }
    
    beforeTest(test) {
        ++this.tests;
        if (this.tests <= 1) this.testNameFull = test.parent;
        this.testTitle = test.title;
    }
    
    async afterTest(test, context, results) {
        if (test._currentRetry >= 0 && !results.passed) {
            --this.tests;
            if(test._currentRetry === test._retries || test._retries === -1) {
                let testError = results.error.matcherResult.message().replace(/[\u001b\u009b][-[+()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
                ++this.failedTests;
                ++this.tests;
                const attach = failedAttachment(test, testError.toString(), results);
                this.attachment.push(attach);
                return;
            }
            return;
        }

        if (results.passed) {
            ++this.passedTests;
            this.attachment.push(passedAttachment(test, results));
        }
    }
    
    async after() {
        this.attachment[0].title = `${this.testNameFull}`;
        this.attachment[0].color = `#ffc107`;
        this.attachment.push({author_name: `Total tests: ${this.tests} | Total passed: ${this.passedTests} | Total failed: ${this.failedTests}`, color: `#4366c7` });
        if (this.failedTests > 0 && this.options.notifyOnlyOnFailure === true) {
            await this.webhook.send({ attachments: this.attachment });
            return;
        }
        if(!this.options.notifyOnlyOnFailure === true) {
            await this.webhook.send({ attachments: this.attachment });
        }
      }

}

module.exports = SlackService;