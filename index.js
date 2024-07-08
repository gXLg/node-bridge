(async () => {

  const tunnel = require("./lib/tunnel.js");
  tunnel.test();
  const uuid = tunnel.init();

  const dns = require("./lib/dns.js");
  const old_records = dns.init();

  const servers = require("./lib/servers.js");
  const { new_records, runlist, dir } = servers.init();

  const services = await dns.update(old_records, new_records, uuid);

  const runner = require("./lib/runner.js");

  for (const server in runlist) {
    const command = runlist[server];
    const cwd = dir[server];
    const port = services[server];
    console.log("Starting server for", server, "on port", port);
    runner.start(command, cwd, port);
  }

  tunnel.run();

})();
