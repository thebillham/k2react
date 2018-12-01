const { IncomingWebhook } = require('@slack/client');
var webhook = new IncomingWebhook(process.env.REACT_APP_SLACK_WEBHOOK);

export const sendSlackMessage = (message, json) => {
  let text;
  if (json) text = message
    else text = { text: message };
  fetch(process.env.REACT_APP_SLACK_WEBHOOK, {
    method: 'POST',
    body: JSON.stringify(text),
  });
}
