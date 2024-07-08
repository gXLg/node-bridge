const axios = require("axios");
const fs = require("fs");

const base = "https://api.cloudflare.com/client/v4/zones";
const headers = { "Content-Type": "application/json" };
try {
  const auth = JSON.parse(
    fs.readFileSync("cloudflare.json")
  );
  if (!auth.api_key) {
    console.error("The field 'api_key' is required!");
    process.exit(1);
  }
  headers["X-Auth-Key"] = auth.api_key;

  if (!auth.email) {
    console.error("The field 'email' is required!");
    process.exit(1);
  }
  headers["X-Auth-Email"] = auth.email;

} catch {
  console.error("Couod not read auth data, please make sure to create a valid 'cloudflare.json' file!");
  process.exit(1);
}


const cache_zones = { };
const cache_records = { };

async function fetch_zones() {
  const res = await axios.get(base, { headers });
  for (const entry of res.data.result) {
    cache_zones[entry.name] = entry.id;
  }
}

async function fetch_records(zone) {
  const res = await axios.get(
    base + "/" + zone + "/dns_records", { headers }
  );
  for (const entry of res.data.result) {
    cache_records[entry.name] = entry.id;
  }
}

async function deleteRecord(record) {
  const domain = record.split(".").slice(-2).join(".");
  if (!(domain in cache_zones)) {
    await fetch_zones();
  }
  if (!(domain in cache_zones)) {
    console.warn(
      "The domain '" + domain + "' does not belong to you, ignoring..."
    );
    return;
  }
  const zone = cache_zones[domain];
  if (!(record in cache_records)) {
    await fetch_records(zone);
  }
  if (!(record in cache_records)) {
    console.warn(
      "The record '" + record + "' does not exist, ignoring..."
    );
    return;
  }
  const id = cache_records[record];

  await axios.delete(base + "/" + zone + "/dns_records/" + id, { headers });
}

async function createRecord(uuid, record) {
  const domain = record.split(".").slice(-2).join(".");
  if (!(domain in cache_zones)) {
    await fetch_zones();
  }
  if (!(domain in cache_zones)) {
    console.error(
      "The domain '" + domain + "' does not belong to you!"
    );
    process.exit(1);
  }
  const zone = cache_zones[domain];
  if (!(record in cache_records)) {
    await fetch_records(zone);
  }
  if (!(record in cache_records)) {
    await axios.post(
      base + "/" + zone + "/dns_records",
      {
        "type": "CNAME",
        "name": record,
        "content": uuid + ".cfargotunnel.com",
        "proxied": true
      },
      { headers }
    );
  } else {
    console.error("The record '" + record + "' already exists! You will have to manually delete it.");
    process.exit(1);
  }
}

module.exports = { deleteRecord, createRecord };
