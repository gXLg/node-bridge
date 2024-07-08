(async () => {

  const tunnel = require("./lib/tunnel.js");
  tunnel.test();
  const uuid = tunnel.init();

  const dns = require("./lib/dns.js");
  const old_records = dns.init();

  const servers = require("./lib/servers.js");
  const { new_records, runlist } = servers.init();

  const services = await dns.update(old_records, new_records, uuid);

  const runner = require("./lib/runner.js");

  for (const record in runlist) {
    const config = runlist[record];

    const start = config.run;
    const stop = config.stop;
    const cwd = config.dir;
    const port = services[record];
    console.log("Starting server for", record, "on port", port);
    runner.start(start, stop, cwd, port);
  }

  tunnel.run();

})();
