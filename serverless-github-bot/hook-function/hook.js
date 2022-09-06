const { Octokit } = require("@octokit/core");
const { createAppAuth } = require("@octokit/auth-app");

const DocumentClient = require('aws-sdk/clients/dynamodb').DocumentClient;
const dynamoDb = new DocumentClient();


exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    if (body.action === 'opened') {
        const data = await dynamoDb
        .scan({
            TableName: process.env.TABLE_NAME,
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
        await installationOctokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
            owner: body.issue.user.login,
            repo: body.repository.name,
            issue_number: body.issue.number,
            body: "hello from a Lambda-powered Github App 🔥",
        });
    }
};