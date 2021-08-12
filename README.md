# neo-deploy-mta

CLI tool for deploying MTAs to SAP BTP, Neo environment.

[![Build Status](https://dev.azure.com/leo-ls/neo-deploy-mta-oauth/_apis/build/status/leo-ls.neo-deploy-mta-oauth?branchName=main)](https://dev.azure.com/leo-ls/neo-deploy-mta-oauth/_build/latest?definitionId=4&branchName=main)
[![npm](https://img.shields.io/npm/v/neo-deploy-mta-oauth)](https://www.npmjs.com/package/neo-deploy-mta-oauth)

## Motivation

1. SAP BTP, Neo environment [is not going away anytime soon](https://blogs.sap.com/2020/08/10/sap-cloud-platform-multi-cloud-strategy-faqs/);

2. The official [Neo console client](https://help.sap.com/viewer/ea72206b834e4ace9cd834feed6c0e09/Cloud/en-US/76132306711e1014839a8273b0e91070.html) uses basic authentication, which adds a burden of maintaining an user account for CI pipelines;

3. [Project Piper](https://www.project-piper.io/)'s CLI still does not expose the [`neoDeploy` step](https://www.project-piper.io/steps/neoDeploy/) as a command, so the only way to use it is through Jenkins.

## How it works

Same logic as implemented in the [`deployWithBearerToken` method](https://github.com/SAP/jenkins-library/blob/15f533c536549f49164796e41d6d4eef8aaeeaf5/vars/neoDeploy.groovy#L401) from the `neoDeploy` step.

## Usage

### Prerequisite

Have an OAuth API client ready for your subaccount. Follow step 1 on the [help document](https://help.sap.com/viewer/ea72206b834e4ace9cd834feed6c0e09/Cloud/en-US/392af9d162694d6595499f1549978aa6.html).  
When assigning scopes, make sure to:  
1. give the client a meaningful description; and
2. select the **Solution Lifecycle Management** API scopes (**Read Multi-Target Applications** and **Manage Multi-Target Applications**).

### Installation

```bash
# install the tool globally
npm install --global neo-deploy-mta-oauth

# or locally as a dev dependency
npm install --save-dev neo-deploy-mta-oauth
```

### CLI

Example usage:
```bash
ndmo -a abcde12345 -h myregion.hana.ondemand.com -i abcd1234-ab12-cd34-ef56-abcdef123456 -s dcba4321-ba21-dc43-fe65-fedcba654321 path/to/my/file.mtar
```

Arguments can be provided as CLI options or environment variables. Each CLI option provided overrides the corresponding environment variable.

* **`-a, --account <subaccount>`** *(environment variable: `NDMO_ACCOUNT`)*  
Subaccount technical name, as displayed under the "Subaccount Info" section on the subaccount Overview page.

* **`-h, --host <host>`** *(environment variable: `NDMO_HOST`)*  
Region host, as described [in the documentation](https://help.sap.com/viewer/ea72206b834e4ace9cd834feed6c0e09/Cloud/en-US/d722f7cea9ec408b85db4c3dcba07b52.html).

* **`-i, --client-id <clientid>`** *(environment variable: `NDMO_CLIENT_ID`)*  
OAuth client ID for the API client.

* **`-s, --client-secret <clientsecret>`** *(environment variable: `NDMO_CLIENT_SECRET`)*  
OAuth client secret for the API client.