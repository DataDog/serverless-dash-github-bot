'use strict';
const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'});
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

module.exports.webhook = async (event) => {
  await sqs.sendMessage({
    MessageBody: event.body,
    QueueUrl: process.env.SQS_QUEUE
  }).promise()
  return {
    statusCode: 200,
    headers:
    {
      "content-type": "application/json"
    },
    body: JSON.stringify({status: 'pushed', body})
  }
}

module.exports.processor = async (event) => {
  console.log('sqs worker received: ', JSON.stringify(event, null, 2))
  return
}