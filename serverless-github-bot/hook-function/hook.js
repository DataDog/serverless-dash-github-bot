const { Octokit } = require("@octokit/core");
const { createAppAuth } = require("@octokit/auth-app");

const DocumentClient = require('aws-sdk/clients/dynamodb').DocumentClient;
const dynamoDb = new DocumentClient();


exports.handler = async (event) => {
    console.log(event);
    const data = await dynamoDb
        .scan({
            TableName: process.env.TABLE_NAME,
        })
        .promise();
    const firstItem = data.Items[0]; // maybe we need something cleaner here
    
    const installationOctokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId: firstItem.app_id,
          privateKey: firstItem.pem,
          installationId: event.data.installationId,
        },
    });
      
    await installationOctokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
        owner: "maxday", // need to take the owner value from `event`
        repo: "test-web-hooks", // need to take the repo value from `event`
        issue_number: 1, // need to take the issue_number from `event`
        body: "hello from a Lambda-powered Github App 🔥",
    });
};