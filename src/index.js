const { IncomingWebhook } = require(`@slack/webhook`);
const { failedAttachment, passedAttachment } = require(`./util`);

class SlackService {

    constructor(options, caps, config) {
        this.options = options;
        this.caps = caps;
        this.config = config;
        this.webhook = this.options.webHookUrl 
                        ? new IncomingWebhook(this.options.webHookUrl) 
                        : (function() { 
                            console.error(`[slack-error]: Slack webhook URL is not defined`);
                            return;
                        })();
        this.failedTests = 0;
        this.passedTests = 0;
        this.tests = 0;
        this.scenarios = 0;
        this.failedScenarios = 0;
        this.passedScenarios = 0;
        this.steps = 0;
        this.passedSteps = 0;
        this.failedSteps = 0;
        this.testNameFull = ``;
        this.attachment = [{
            pretext: `*${this.options.messageTitle || `Webdriverio Slack Reporter`}*`,
            title: "",
        }];
        this.testTitle = ``;
    }

    beforeFeature(uri, feature) {
        this.testNameFull = `Feature: ${feature.name}`;
    }

    beforeScenario(world){
        ++this.scenarios;
        this.attachment.push({
                "color": "#ff8c00",
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": `Scenario ${this.scenarios}: ${world.pickle.name.replace(`\n`, ``)}`,
                            "emoji": true
                        }
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "plain_text",
                                "text": `${this.testNameFull} | browser: ${this.caps.browserName} ${this.caps.browserVersion ? `v${this.caps.browserVersion}` : ``}`,
                                "emoji": true
                            }
                        ]
                    }
                ]
        })
    }

    async afterStep (test, context, { error, result, duration, passed, retries }) {
        ++this.steps;
        this.testTitle = `${test.keyword}${test.text}`;
        if (retries.attempts >= 0 && !passed) {
            --this.steps;
            if(retries.attempts === retries.limit || retries.limit === 0) {
                let errorMessage;
                if(error.matcherResult) {
                    errorMessage = error.matcherResult.message();
                } else {
                    errorMessage = error.toString();
                }
                let testError = errorMessage.replace(/[\u001b\u009b][-[+()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
                ++this.failedSteps;
                ++this.steps;
                const attach = failedAttachment({ title: this.testTitle, _currentRetry: retries.attempts }, testError, { duration });
                this.attachment.push(attach);
                return;
            }
        }

        if (passed) {
            ++this.passedSteps;
            this.attachment.push(passedAttachment({ title: this.testTitle, _currentRetry: retries.attempts }, { duration }));
        }
        
    }
    
    afterTest(test, context, results) {
        ++this.tests;
        this.testTitle = test.title;
        if (this.tests <= 1) this.testNameFull = test.parent || test.fullName;
        if (test._currentRetry >= 0 && !results.passed) {
            --this.tests;
            if(test._currentRetry === test._retries || test._retries === -1) {
                let errorMessage;
                if(error.matcherResult) {
                    errorMessage = error.matcherResult.message();
                } else {
                    errorMessage = error.toString();
                }
                let testError = errorMessage.replace(/[\u001b\u009b][-[+()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
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

    afterScenario(world) {
        world.result.status === 6 ? ++this.failedScenarios : ++this.passedScenarios;
        if(this.steps === 0) {
            this.attachment.push({
                color: `#dc3545`,
                author_name: `This scenario was failed before entering into steps`, 
                footer: `Please check the execution log for more details`,
                footer_icon: `https://www.pinclipart.com/picdir/big/31-316209_circle-x-clipart-reject-icon-png-download.png`,
                ts: Date.now()
            });
            return;
        }
        this.attachment.push({
            author_name: `Total Steps: ${this.steps} | Total Passed Steps: ${this.passedSteps} | Total Failed Steps: ${this.failedSteps}`
        });
        this.steps = 0, this.passedSteps = 0, this.failedSteps = 0;
    }
    
    async after() {
        if(this.config.framework === `cucumber`) {
            this.attachment.push({
                author_name: `Total Scenarios: ${this.scenarios} | Passed Scenarios: ${this.passedScenarios} | Failed Scenarios: ${this.failedScenarios}`
            })
        } else {
            this.attachment[0].title = `${this.testNameFull} | browser: ${this.caps.browserName} ${this.caps.browserVersion ? `v${this.caps.browserVersion}` : ``}`;
            this.attachment[0].color = `#ffc107`;
            this.attachment.push({author_name: `Total tests: ${this.tests} | Total passed: ${this.passedTests} | Total failed: ${this.failedTests}`, color: `#4366c7` });
        }
        //Will be handled in next iteration
        /**
        let payload = {};
        if(this.options.buildURL) {
            const block = [{
                type: `section`,
                text: {
                    type: `mrkdwn`,
                    text: `* <${this.options.buildURL}|Test>*`
                  }
                }];
                payload.attachments = this.attachment;
                payload.blocks = block;

        } else {
            payload.attachments = this.attachment;
        }
        **/

        if ((this.failedTests > 0 || this.failedScenarios > 0) && this.options.notifyOnlyOnFailure === true) {
            await this.webhook.send({ attachments : this.attachment });
            return;
        }

        if(!this.options.notifyOnlyOnFailure === true) {
            await this.webhook.send({ attachments : this.attachment });
        }
      }

    }

module.exports = SlackService;
