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
  const checking = new Set();
  for (const e of newr) {
    if (oldr.has(e)) checking.add(e);
  }

  const cloudflare = require("./cloudflare.js");

  // delete old records
  const there = new Set(oldr);
  for (const r of deleting) {
    console.log("Deleting old record", r);
    await cloudflare.deleteRecord(uuid, r);
    there.delete(r);
    fs.writeFileSync(".tunnel/dns.json", JSON.stringify([...there]));
  }

  // create new records
  const added = [...there];
  for (const r of adding) {
    console.log("Creating new record", r);
    await cloudflare.createRecord(uuid, r);
    added.push(r);
    fs.writeFileSync(".tunnel/dns.json", JSON.stringify(added));
  }

  // checking health of existing records
  for (const r of checking) {
    console.log("Checking health of record", r, "...");
    const status = await cloudflare.checkRecord(uuid, r);
    if (status) {
      console.log("Healthy!");
    } else {
      console.log("Updating record", r);
      await cloudflare.createRecord(uuid, r);
    }
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
      "  - hostname: " + r,
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
