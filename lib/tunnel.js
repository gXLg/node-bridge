const { spawnSync, spawn } = require("child_process");
const namae = require("./namae");

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
    const name = namae() + "-" + Date.now().toString(36);
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

async function run() {
  const cloudflare = require("./cloudflare.js");
  const name = await cloudflare.getTunnelName();
  console.log("Starting tunnel", name);
  const t = spawn(cf, [
    "tunnel", "--config", ".tunnel/ingress.yml", "run"
  ]);

  process.on("SIGINT", () => {
    console.log("Killing tunnel");
    t.kill("SIGINT");
  });
}

module.exports = { test, init, run };
