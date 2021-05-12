const failedAttachment = function(test, errorMessage, { duration }) {
    const failedMessage = {
      color: `#dc3545`,
      author_name: `${test.title}`,
      footer: `Uh! Oh! FAILED - Duration: ${timeConverter(duration)}\n${test._retriedTest ? `This is a retried test and failed after ${test._currentRetry} retries` : ``}\n${errorMessage}`,
      footer_icon: `https://www.pinclipart.com/picdir/big/31-316209_circle-x-clipart-reject-icon-png-download.png`,
      ts: Date.now()
    };
    return failedMessage;
};

const passedAttachment = function(test, { duration }) {
    const passedMessage = {
        color: `#6bc77c`,
        author_name: `${test.title}`,
        footer: `Woo! Ooh! PASSED - Duration: ${timeConverter(duration)}\n${test._retriedTest ? `This is a retried test and passed after ${test._currentRetry} retries` : ``}`,
        footer_icon: `https://vectorified.com/images/icon-pass-19.png`
    };
    return passedMessage;
};

function timeConverter(duration) {
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(0);
    return minutes + `:` + (seconds < 10 ? `0` : ``) + seconds;
}

module.exports = { failedAttachment, passedAttachment };

  