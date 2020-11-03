"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Plugin {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options;
        this.variables = serverless.service.custom['amplify-auth'];
        this.hooks = {
            'before:package:createDeploymentArtifacts': this.run.bind(this),
        };
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.variables) {
                this.serverless.cli.log(`serverless-amplify-auth: Set the custom.amplify-auth field to an appropriate value.`);
                return;
            }
            if (!this.variables.appId) {
                this.serverless.cli.log(`serverless-amplify-auth: The required fields do not have a value set. (custom.amplify-auth.appId)`);
                return;
            }
            const awsProvider = this.serverless.getProvider('aws');
            const stage = yield awsProvider.getStage();
            this.variables.envName = this.variables.envName || stage;
            this.serverless.cli.log(`serverless-amplify-auth values: ${JSON.stringify({
                appId: this.variables.appId,
                profile: this.variables.profile,
                envName: this.variables.envName,
                isClearPolicy: this.variables.isClearPolicy,
            })}`);
            // if (this.variables.profile) {
            //   const credentials = new SharedIniFileCredentials({
            //     profile: this.variables.profile,
            //   })
            //   config.credentials = credentials
            // }
            // const amplify = new Amplify()
            // const amplifyData = await amplify
            //   .getBackendEnvironment({
            //     appId: this.variables.appId,
            //     environmentName: this.variables.envName,
            //   })
            //   .promise()
            // const cloudformation = new CloudFormation()
            // const cloudformationData = await cloudformation
            //   .describeStackResources({
            //     StackName: amplifyData.backendEnvironment.stackName,
            //   })
            //   .promise()
            // const authRole = cloudformationData.StackResources.find((r) => {
            //   return r.LogicalResourceId === 'AuthRole'
            // }).PhysicalResourceId
            // const unauthRole = cloudformationData.StackResources.find((r) => {
            //   return r.LogicalResourceId === 'UnauthRole'
            // }).PhysicalResourceId
            // const clearRolePolicy = async (roleName: string) => {
            //   const iam = new IAM()
            //   const policies = await iam
            //     .listRolePolicies({
            //       RoleName: roleName,
            //     })
            //     .promise()
            //   for (const policyName of policies.PolicyNames) {
            //     await iam
            //       .deleteRolePolicy({
            //         RoleName: roleName,
            //         PolicyName: policyName,
            //       })
            //       .promise()
            //     this.serverless.cli.log(
            //       `serverless-amplify-auth: Successfully delete policy (${policyName}).`,
            //     )
            //   }
            // }
            // const putRolePolicy = async (roleName: string, policy: PolicyValue) => {
            //   const region = await awsProvider.getRegion()
            //   const accountId = await awsProvider.getAccountId()
            //   let policyDocumentString = JSON.stringify(policy.PolicyDocument)
            //   policyDocumentString = policyDocumentString
            //     .replace(/#{AWS::Region}/g, region)
            //     .replace(/#{AWS::AccountId}/g, accountId)
            //   const iam = new IAM()
            //   await iam
            //     .putRolePolicy({
            //       RoleName: roleName,
            //       PolicyName: policy.PolicyName,
            //       PolicyDocument: policyDocumentString,
            //     })
            //     .promise()
            //   this.serverless.cli.log(
            //     `serverless-amplify-auth: ${roleName} -> ${policyDocumentString}`,
            //   )
            // }
            // const refreshPolicy = async (roleName: string, policies: PolicyValue[]) => {
            //   if (this.variables.isClearPolicy) await clearRolePolicy(roleName)
            //   for (const policy of policies) {
            //     await putRolePolicy(roleName, policy)
            //   }
            // }
            // if (this.variables.authRole)
            //   await refreshPolicy(authRole, this.variables.authRole)
            // else this.serverless.cli.log(`serverless-amplify-auth: Skipped authRole.`)
            // if (this.variables.unauthRole)
            //   await refreshPolicy(unauthRole, this.variables.unauthRole)
            // else this.serverless.cli.log(`serverless-amplify-auth: Skipped unauthRole.`)
        });
    }
}
exports.default = Plugin;
module.exports = Plugin;
//# sourceMappingURL=index.js.map