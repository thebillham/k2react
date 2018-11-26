var IncomingWebhook = require('@slack/client').IncomingWebhook;
var url = "<YOUR--SLACK--WEBHOOK--URL>";
var webhook = new IncomingWebhook(url);

export const sendSlackMessage = message => {
  webhook.send(message, function(err, header, statusCode, body) {
    if (err) {
      console.log('Error:', err);
    } else {
      console.log('Received', statusCode, 'from Slack');
    }
  });
}
