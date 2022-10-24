// import our dependencies
const { Octokit } = require("@octokit/core");
const { createAppAuth } = require("@octokit/auth-app");
const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

const dynamoDb = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
});

const sns = new AWS.SNS({ apiVersion: "2012-11-05" });

module.exports.webhook = async (event) => {
    await sns
        .publish({
            Message: event.body,
            TopicArn: process.env.SNS_TOPIC_ARN,
        })
        .promise();
    return {
        statusCode: 200,
        headers: {
            "content-type": "application/json",
        },
    };
};

module.exports.processor = async (event) => {
    // parse the incoming event
    for (let e of event.Records) {
        // Parse the SQS message
        const { Message } = JSON.parse(e.body);
        // And parse the underlying SNS message
        const body = JSON.parse(Message);
        // let's make sure that we're dealing with a 'open an issue' event
        if (body.action !== "opened") {
            return {
                statusCode: 200,
            };
        }
        // retrieve auth PEM and app installation details to generate a token
        const data = await dynamoDb
            .scan({
                TableName: "serverless_dash_workshop",
            })
            .promise();
        const firstItem = data.Items[0];

        const installationOctokit = new Octokit({
            authStrategy: createAppAuth,
            auth: {
                appId: firstItem.app_id,
                privateKey: firstItem.pem,
                installationId: body.installation.id,
            },
        });
        // post the comment ! 🔥
        try {
            await installationOctokit.request(
                "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
                {
                    owner: body.issue.user.login,
                    repo: body.repository.name,
                    issue_number: body.issue.number,
                    body: "hello from an asynchronous Lambda-powered Github App 🔥",
                }
            );
        } catch (e) {
            console.error(e);
        }
    }
};
