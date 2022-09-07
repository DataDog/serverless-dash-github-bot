'use strict';
const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'});
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

module.exports.webhook = async (event) => {
  const body = JSON.parse(event.body)
  body.ajTimestamp = Date.now()

  await sns.publish({
    Message: JSON.stringify(body),
    TopicArn: process.env.TOPIC_ARN
  }).promise()
  return {
    statusCode: 200,
    headers:
    {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      keyOne: 'foobar',
      myObject: {
        anotherKey: ['array', 'of', 'values']
      },
      val: null
    })
  }
}

module.exports.processor = async (event) => {
  console.log('sqs worker received: ', JSON.stringify(event, null, 2))
  return
}