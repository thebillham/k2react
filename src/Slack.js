const { IncomingWebhook } = require('@slack/client');
var webhook = new IncomingWebhook(process.env.REACT_APP_SLACK_WEBHOOK);

export const sendSlackMessage = message => {
  fetch(process.env.REACT_APP_SLACK_WEBHOOK, {
    method: 'POST',
    body: message,
  });
  // webhook.send(message, function(err, res) {
  //   if (err) {
  //     console.log('Error:', err);
  //   } else {
  //     console.log('Received', res, 'from Slack');
  //   }
  // });
}
