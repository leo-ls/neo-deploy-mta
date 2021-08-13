"use strict";

const { default: axios } = require("axios");
const FormData = require("form-data");
const { readFile } = require("fs/promises");
const { parse, resolve } = require("path");

axios.defaults.withCredentials = true;

const getOAuthURL = (host) => `https://api.${host}/oauth2/apitoken/v1`;

const getAuthContext = (url, username, password) => {
  const data = new URLSearchParams({ grant_type: "client_credentials" });
  const config = { auth: { username, password } };

  return axios
    .post(url, data, config)
    .then(({ data: { access_token = "" } }) => {
      if (!access_token) {
        throw new Error("Could not retrieve oauth token");
      }

      return { headers: { Authorization: `Bearer ${access_token}` } };
    });
};

const getDeploymentURL = (account, host, deploymentId = "") =>
  `https://slservice.${host}/slservice/v1/oauth/accounts/${account}/mtars${deploymentId}`;

const deploy = async (url, authContext, filePath) => {
  const resolvedPath = resolve(process.cwd(), filePath);
  const { base } = parse(resolvedPath);
  const file = await readFile(resolvedPath);
  const data = new FormData();

  data.append("file", file, base);

  const config = { headers: { ...data.getHeaders(), ...authContext.headers } };

  return axios.post(url, data, config).then(({ data: { id = "" } }) => {
    if (!id) {
      throw new Error(`Error while deploying ${base}`);
    }

    return `/${id}`;
  });
};

const getDeploymentStatus = (url, config) =>
  axios.get(url, config).then(({ data: { state = "", progress = [] } }) => {
    if (!["DONE", "FAILED", "RUNNING"].includes(state)) {
      throw new Error(`Deployment failed with unknown status ${state}`);
    }

    const { internalMessage = "" } = progress[0].modules[0].error || {};

    return { state, internalMessage };
  });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = async (filePath, options) => {
  const account = options.account || process.env.NDMO_ACCOUNT;
  const host = options.host || process.env.NDMO_HOST;
  const clientId = options.clientId || process.env.NDMO_CLIENT_ID;
  const clientSecret = options.clientSecret || process.env.NDMO_CLIENT_SECRET;

  console.log("[info]", "Retrieving oauth token...");
  const oauthURL = getOAuthURL(host);
  const authContext = await getAuthContext(oauthURL, clientId, clientSecret);

  const { base } = parse(filePath);
  console.log("[info]", `Deploying ${base} to ${account}...`);
  const deploymentURL = getDeploymentURL(account, host);
  const deploymentID = await deploy(deploymentURL, authContext, filePath);

  const deploymentStateURL = getDeploymentURL(account, host, deploymentID);
  let status = await getDeploymentStatus(deploymentStateURL, authContext);

  while (status.state === "RUNNING") {
    await sleep(10);
    console.log("[info]", "Deployment is still running...");
    status = await getDeploymentStatus(deploymentStateURL, authContext);
  }

  if (status.state === "DONE") {
    console.log("[info]", "Deployment has succeeded.");
  } else if (status.state === "FAILED") {
    throw new Error(
      `Deployment has failed with the message: ${status.internalMessage}`
    );
  }
};
