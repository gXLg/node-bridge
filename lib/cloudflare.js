const axios = require("axios");
const fs = require("fs");

const base = "https://api.cloudflare.com/client/v4/";
const { config } = require("./config.js");
const headers = {
  "Content-Type": "application/json",
  "X-Auth-Key": config.api_key,
  "X-Auth-Email": config.email
};

const cache_zones = { };
const cache_records = { };

async function fetch_zones() {
  const res = await axios.get(base + "zones", { headers });
  for (const entry of res.data.result) {
    cache_zones[entry.name] = entry.id;
  }
}

async function fetch_records(zone) {
  const res = await axios.get(
    base + "zones/" + zone + "/dns_records", { headers }
  );
  for (const entry of res.data.result) {
    if (entry.type == "CNAME") {
      cache_records[entry.name] = entry.id;
    }
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

  await axios.delete(base + "zones/" + zone + "/dns_records/" + id, { headers });
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
  const settings = {
    "type": "CNAME",
    "name": record,
    "content": uuid + ".cfargotunnel.com",
    "proxied": true,
    "comment": "Created with node-bridge for " + await getTunnelName()
  };
  if (!(record in cache_records)) {
    await axios.post(
      base + "zones/" + zone + "/dns_records",
      settings,
      { headers }
    );
  } else {
    console.warn("The record '" + record + "' already exists and will be overwritten");
    await axios.put(
      base + "zones/" + zone + "/dns_records/" + cache_records[record],
      settings,
      { headers }
    );
  }
}

async function getTunnelName() {
  const { AccountTag, TunnelID} = JSON.parse(
    fs.readFileSync(".tunnel/tunnel.json")
  );

  const res = await axios.get(
    base + "accounts/" + AccountTag + "/tunnels/" + TunnelID,
    { headers }
  );

  return res.data.result.name;
}

module.exports = { deleteRecord, createRecord, getTunnelName };
