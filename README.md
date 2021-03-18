# serverless-amplify-auth 🔑

Update Policy for Amplify's Auth Role and Unauth Role in the Serverless Framework.

## :hammer: Minimum requirements

- [Node.js v12.19.0 or higher](https://nodejs.org/en/)
- [Serverless Framework v2.3.0 or higher](https://www.serverless.com/)

## 💾 Installation

Install the plugin via Yarn (recommended)

```bash
yarn add --dev serverless-amplify-auth
```

or via NPM

```bash
npm i -D serverless-amplify-auth
```

You must also add the `amplify:GetBackendEnvironment` permission to the IAM Role.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "amplify:GetBackendEnvironment"
            ],
            "Resource": "*"
        }
    ]
}
```

## 🛠️ Configuring the plugin

Add `serverless-amplify-auth` to the plugins section of `serverless.yml`

```yaml
plugins:
   - serverless-amplify-auth
```

Add the following example config to the custom section of `serverless.yml`

```yaml
custom:
  amplify-auth:
    appId: XXXXXXXXXXXXX # <string (required): Amplify's Application ID>
    envName: ${opt:stage, self:provider.stage, 'dev'} # <string (required): Amplify's environment name>
    # profile: default # <string (optional): Specify an AWS Profile that can handle Amplify and IAM>
    # isClearPolicy: false # <boolean (optional): Delete all policies existing in the Role before updating the Policy>
    unauthRole: # <Policy (optional): Write a policy for the unauthRole created by Amplify auth>
      - PolicyName: "Unauth"
        PolicyDocument:
          Version: "2012-10-17"
          Statement:
            - Effect: Allow
              Action:
                - appsync:GraphQL
              Resource:
                - arn:aws:appsync:#{AWS::Region}:#{AWS::AccountId}:apis/XXXXXXXXXXXXXXX/types/Mutation/fields/createComment
                - arn:aws:appsync:#{AWS::Region}:#{AWS::AccountId}:apis/XXXXXXXXXXXXXXX/types/Query/fields/listComments
                - arn:aws:appsync:#{AWS::Region}:#{AWS::AccountId}:apis/XXXXXXXXXXXXXXX/types/Subscription/fields/onCreateComment
    authRole: # <Policy (optional): Write a policy for the authRole created by Amplify auth>
      - PolicyName: "Auth"
        PolicyDocument:
          Version: "2012-10-17"
          Statement:
            - Effect: Allow
              Action:
                - appsync:GraphQL
              Resource:
                - arn:aws:appsync:#{AWS::Region}:#{AWS::AccountId}:apis/XXXXXXXXXXXXXXX/types/Mutation/*
                - arn:aws:appsync:#{AWS::Region}:#{AWS::AccountId}:apis/XXXXXXXXXXXXXXX/types/Query/*
                - arn:aws:appsync:#{AWS::Region}:#{AWS::AccountId}:apis/XXXXXXXXXXXXXXX/types/Subscription/*
```

In the `custom.amplify-auth.authRole` and `custom.amplify-auth.unauthRole` fields, you can use `#{AWS::AccountId}` and `#{AWS::Region}`. The `#{AWS::AccountId}` and `#{AWS::Region}` can be used to set the value of the AWS Account ID and Region information set in the AWS Profile, which are necessary to build an ARN. 💪

## ▶️ Usage

### `serverless deploy`

Update the `authRole` and `unauthRole` policy of Amplify specified by `custom.amplify-auth.appId` at the same time of deploying of the functions.

### `serverless package`

Update the `authRole` and `unauthRole` policy of Amplify specified by `custom.amplify-auth.appId`.

## 🎁 Contributing

If you have any questions, please feel free to reach out to me directly on Twitter [nikaera](https://twitter.com/n1kaera), or feel free to create an Issue or PR for you.

## License

[MIT](https://github.com/nikaera/serverless-amplify-auth/blob/main/LICENSE)
