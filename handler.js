'use strict';
const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'});
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};


module.exports.webhook = async(event) => {
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