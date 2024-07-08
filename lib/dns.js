const fs = require("fs");

function init() {
  if (!fs.existsSync(".tunnel/dns.json")) {
    fs.writeFileSync(".tunnel/dns.json", "[]");
  }
  return new Set(
    JSON.parse(fs.readFileSync(".tunnel/dns.json"))
  );
}

async function update(oldr, newr, uuid) {
  const adding = new Set();
  for (const e of newr) {
    if (!oldr.has(e)) adding.add(e);
  }
  const deleting = new Set();
  for (const e of oldr) {
    if (!newr.has(e)) deleting.add(e);
  }

  const cloudflare = require("./cloudflare.js");

  // delete old records
  for (const r of deleting) {
    console.log("Deleting old record", r);
    await cloudflare.deleteRecord(r);
  }

  const added = [];

  // create new records
  for (const r of adding) {
    console.log("Creating new record", r);
    await cloudflare.createRecord(uuid, r);
    added.push(r);
    fs.writeFileSync(".tunnel/dns.json", JSON.stringify(added));
  }

  // update ingress rules
  const services = { };
  const configs = [
    "tunnel: " + uuid,
    "credentials-file: .tunnel/tunnel.json",
    "",
    "ingress:"
  ];
  let port = 18000;
  for (const r of newr) {
    configs.push(
      "  - hostname: " + r + "\n" +
      "    service: http://127.0.0.1:" + port
    );
    services[r] = port;
    port ++;
  }
  configs.push("  - service: http_status:404");
  fs.writeFileSync(".tunnel/ingress.yml", configs.join("\n"));
  return services;
}

module.exports = { init, update };
