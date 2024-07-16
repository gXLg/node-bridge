const fs = require("fs");

try {
  const config = JSON.parse(
    fs.readFileSync("cloudflare.json")
  );
  if (!config.api_key) {
    console.error("The field 'api_key' is required!");
    process.exit(1);
  }
  if (!config.email) {
    console.error("The field 'email' is required!");
    process.exit(1);
  }
  module.exports = { config };

} catch {
  console.error("Could not read auth data, please make sure to create a valid 'cloudflare.json' file!");
  process.exit(1);
}
