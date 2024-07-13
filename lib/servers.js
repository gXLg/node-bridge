const fs = require("fs");
const path = require("node:path");

function init() {
  const servers = fs
    .readdirSync("servers", { "withFileTypes": true })
    .filter(c => c.isDirectory())
    .map(c => c.name);

  const new_records = new Set();
  const runlist = { };
  for (const server of servers) {
    // read config in that server
    const config = JSON.parse(
      fs.readFileSync("servers/" + server + "/node-bridge.json")
    );
    if (new_records.has(config.record)) {
      console.error("'" + config.record + "' is listed multiple times!");
      process.exit(1);
    }
    new_records.add(config.record);
    const c = {
      "record": config.record,
      "run": config.run,
      "stop": config.stop ?? null
    };
    // apply plugins on top of eachother
    for (const plugin of config.plugins ?? []) {
      require("./plugins/" + plugin).apply(c);
    }

    runlist[config.record] = {
      "run": c.run,
      "stop": c.stop,
      "dir": path.resolve("servers/" + server)
    };
  }
  return { new_records, runlist };
}

module.exports = { init };
