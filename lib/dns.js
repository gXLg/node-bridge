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
  if (oldr.symmetricDifference(newr).size) {
    const cloudflare = require("./cloudflare.js");

    // delete old records
    for (const r of oldr.difference(newr)) {
      await cloudflare.deleteRecord(r);
    }

    // create new records
    for (const r of newr.difference(oldr)) {
      await cloudflare.createRecord(uuid, r);
    }

    fs.writeFileSync(".tunnel/dns.json", JSON.stringify([...newr]));
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
