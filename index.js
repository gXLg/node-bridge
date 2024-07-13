(async () => {

  // imports
  const tunnel = require("./lib/tunnel.js");
  const dns = require("./lib/dns.js");
  const servers = require("./lib/servers.js");
  const runner = require("./lib/runner.js");


  // test for the binary
  tunnel.test();

  // init tunnel config
  const uuid = tunnel.init();

  // read old hostname settings
  const old_records = dns.init();

  // parse the servers in the servers/ folder
  const { new_records, runlist } = servers.init();

  // update hostname records
  const services = await dns.update(old_records, new_records, uuid);

  // start the services one after eachother
  for (const record in runlist) {
    const config = runlist[record];
    const start = config.run;
    const stop = config.stop;
    const cwd = config.dir;
    const port = services[record];
    console.log("Starting server for", record, "on port", port);
    runner.start(start, stop, cwd, port);
  }

  // start the tunnel
  tunnel.run();

})();
