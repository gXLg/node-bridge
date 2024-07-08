const { spawnSync, spawn } = require("child_process");

const os = require("os");
const cf = "cloudflared" + (
  os.platform() == "win32" ? ".exe" : ""
);

function test() {
  const test = spawnSync(cf, ["--version"]);
  if (test.error != null) {
    console.error(
      "The '" + cf + "' binary was not found or returned errors,",
      "please check, whether cloudflared is installed."
    );
    process.exit(1);
  }
}

function init() {
  const fs = require("fs");

  if (!fs.existsSync(".tunnel")) {
    fs.mkdirSync(".tunnel");
  }

  // tunnel creation for this instance
  if (!fs.existsSync(".tunnel/tunnel.json")) {
    console.log("Creating a tunnel configuration...");
    const name = "node-bridge-" + Date.now().toString(36);
    const out = spawnSync(
      cf,
      ["tunnel", "create", "--cred-file=.tunnel/tunnel.json", name]
    );
    if (out.status != 0) {
      console.error(
        "Could not create a tunnel,",
        "please check if you are logged in!"
      );
      console.error(out.stderr.toString());
      process.exit(1);
    } else {
      console.log(out.stdout.toString());
    }
  }
  const uuid = JSON.parse(
    fs.readFileSync(".tunnel/tunnel.json")
  ).TunnelID;
  return uuid;
}

function run(uuid) {
  const t = spawn(cf, [
    "tunnel", "--config", ".tunnel/ingress.yml", "run", uuid
  ]);

  process.on("SIGINT", () => t.kill("SIGINT"));
}

module.exports = { test, init, run };