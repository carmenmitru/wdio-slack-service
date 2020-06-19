# WebdriverIO Slack Service

> A WebdriverIO service which sends notifications of test results to Slack.

## Installation

The easiest way is to keep `wdio-slack-service` as a devDependency in your `package.json`.

```json
{
  "devDependencies": {
    "wdio-slack-service": "2.0.6"
  }
}
```

You can simple do it by:

```bash
npm install wdio-slack-service --save-dev
```

Instructions on how to install `WebdriverIO` can be found [here.](https://webdriver.io/docs/gettingstarted.html)

## Configuration
At the top of the wdio.conf.js-file, add:
 
```js
// wdio.conf.js
var slack = require('wdio-slack-service');
```

In order to use the service you need to add slack to your services array in wdio.conf.js

```js
// wdio.conf.js
export.config = {
  services: [
    [slack, {
      webhook: process.env.SLACK_WEBHOOK_URL || "https://hooks.slack.com/........",  
      notifyOnlyOnFailure: true,     
      message:'Test Report'   
    }],
  ],
};
```

## Configuration Options

The following configuration options are supported and are all optional. By default none of the config options are set.
For notifications to be sent `webhook` option should atleast be set.

| Option  | Description                                                                                                                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|         |
| webhook | URL - [Incoming webhook](https://api.slack.com/incoming-webhooks) of the slack channel to which notifications should be sent. If the URL is not configured, notifications will not be sent. |
|notifyOnlyOnFailure|Set this option to true to send notifications only when there are test fail, else nothing will be sent.|
|message| Title of text message which appears in the notification.|
```js
// wdio.conf.js
export.config = {
  services: [
    [slack, {
      webhook: process.env.SLACK_WEBHOOK_URL || "https://hooks.slack.com/........",  
      notifyOnlyOnFailure: true, 
      message:'Test Report'   
    }],
  ],
};
```
