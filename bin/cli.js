#!/usr/bin/env node

const { Command, Option } = require("commander");

const { version } = require("../package.json");

const program = new Command("ndmo");
program.version(version);
program.addHelpText("beforeAll", `neo-deploy-mta-oauth v${version}\n`);

const account = new Option(
  "-a, --account <subaccount>",
  "subaccount technical name - env: NDMO_ACCOUNT"
);
const host = new Option("-h, --host <host>", "region host - env: NDMO_HOST");
const id = new Option(
  "-i, --client-id <clientid>",
  "OAuth client ID - env: NDMO_CLIENT_ID"
);
const secret = new Option(
  "-s, --client-secret <clientsecret>",
  "OAuth client secret - env: NDMO_CLIENT_SECRET"
);

program
  .argument("<file>", "absolute or relative path to .mtar file")
  .addOption(account)
  .addOption(host)
  .addOption(id)
  .addOption(secret)
  .action(require("./main"));

(async () => {
  try {
    program.parseAsync();
  } catch (error) {
    console.error("[error]", error.message);
    process.exit(1);
  }
})();
