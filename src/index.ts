import * as Serverless from 'serverless'
import {
  SharedIniFileCredentials,
  IAM,
  CloudFormation,
  Amplify,
  config,
} from 'aws-sdk'

interface PolicyValue {
  PolicyName: string
  PolicyDocument: object
}

interface Variables {
  appId: string
  profile: string
  envName: string
  isClearPolicy: boolean
  authRole: PolicyValue[]
  unauthRole: PolicyValue[]
}

export default class Plugin {
  serverless: Serverless
  options: Serverless.Options
  hooks: {
    [event: string]: Promise<unknown>
  }
  variables: Variables

  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless
    this.options = options
    this.variables = serverless.service.custom['amplify-auth']

    this.hooks = {
      'before:package:createDeploymentArtifacts': this.run.bind(this),
    }
  }

  async run() {
    if (!this.variables) {
      this.serverless.cli.log(
        `serverless-amplify-auth: Set the custom.amplify-auth field to an appropriate value.`,
      )
      return
    }

    if (!this.variables.appId) {
      this.serverless.cli.log(
        `serverless-amplify-auth: The required fields do not have a value set. (custom.amplify-auth.appId)`,
      )
      return
    }

    const awsProvider = this.serverless.getProvider('aws')
    const stage = await awsProvider.getStage()
    this.variables.envName = this.variables.envName || stage

    this.serverless.cli.log(
      `serverless-amplify-auth values: ${JSON.stringify({
        appId: this.variables.appId,
        profile: this.variables.profile,
        envName: this.variables.envName,
        isClearPolicy: this.variables.isClearPolicy,
      })}`,
    )

    process.env.AWS_SDK_LOAD_CONFIG = 'true'
    if (this.variables.profile) {
      const credentials = new SharedIniFileCredentials({
        profile: this.variables.profile,
      })
      config.credentials = credentials
    }

    const amplify = new Amplify()
    const amplifyData = await amplify
      .getBackendEnvironment({
        appId: this.variables.appId,
        environmentName: this.variables.envName,
      })
      .promise()

    const cloudformation = new CloudFormation()
    const cloudformationData = await cloudformation
      .describeStackResources({
        StackName: amplifyData.backendEnvironment.stackName,
      })
      .promise()

    const authRole = cloudformationData.StackResources.find((r) => {
      return r.LogicalResourceId === 'AuthRole'
    }).PhysicalResourceId
    const unauthRole = cloudformationData.StackResources.find((r) => {
      return r.LogicalResourceId === 'UnauthRole'
    }).PhysicalResourceId

    const clearRolePolicy = async (roleName: string) => {
      const iam = new IAM()
      const policies = await iam
        .listRolePolicies({
          RoleName: roleName,
        })
        .promise()

      for (const policyName of policies.PolicyNames) {
        await iam
          .deleteRolePolicy({
            RoleName: roleName,
            PolicyName: policyName,
          })
          .promise()
        this.serverless.cli.log(
          `serverless-amplify-auth: Successfully delete policy (${policyName}).`,
        )
      }
    }

    const putRolePolicy = async (roleName: string, policy: PolicyValue) => {
      const region = await awsProvider.getRegion()
      const accountId = await awsProvider.getAccountId()

      let policyDocumentString = JSON.stringify(policy.PolicyDocument)
      policyDocumentString = policyDocumentString
        .replace(/#{AWS::Region}/g, region)
        .replace(/#{AWS::AccountId}/g, accountId)

      const iam = new IAM()
      await iam
        .putRolePolicy({
          RoleName: roleName,
          PolicyName: policy.PolicyName,
          PolicyDocument: policyDocumentString,
        })
        .promise()

      this.serverless.cli.log(
        `serverless-amplify-auth: ${roleName} -> ${policyDocumentString}`,
      )
    }

    const refreshPolicy = async (roleName: string, policies: PolicyValue[]) => {
      if (this.variables.isClearPolicy) await clearRolePolicy(roleName)

      for (const policy of policies) {
        await putRolePolicy(roleName, policy)
      }
    }

    if (this.variables.authRole)
      await refreshPolicy(authRole, this.variables.authRole)
    else this.serverless.cli.log(`serverless-amplify-auth: Skipped authRole.`)

    if (this.variables.unauthRole)
      await refreshPolicy(unauthRole, this.variables.unauthRole)
    else this.serverless.cli.log(`serverless-amplify-auth: Skipped unauthRole.`)
  }
}

module.exports = Plugin
