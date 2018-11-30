import { SLACK_TOKEN, SLACK_WEBHOOK } from './keys';
const { IncomingWebhook } = require('@slack/client');
var webhook = new IncomingWebhook(SLACK_WEBHOOK);

export const sendSlackMessage = message => {
  fetch(SLACK_WEBHOOK, {
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
