const fs = require("fs");
const path = require("node:path");

function init() {
  const servers = fs
    .readdirSync("servers", { "withFileTypes": true })
    .filter(c => c.isDirectory())
    .map(c => c.name);

  const new_records = new Set();
  const runlist = { };
  const dir = { };
  for (const server of servers) {
    const config = JSON.parse(
      fs.readFileSync("servers/" + server + "/node-bridge.json")
    );
    if (new_records.has(config.record)) {
      console.error("'" + config.record + "' is listed multiple times!");
      process.exit(1);
    }
    new_records.add(config.record);
    runlist[config.record] = config.run;
    dir[config.record] = path.resolve("servers/" + server);
  }
  return { new_records, runlist, dir };
}

module.exports = { init };
