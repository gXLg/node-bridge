const fs = require("fs");

try {
  const config = JSON.parse(
    fs.readFileSync("config.json")
  );
  if (!config.api_key) {
    console.error("The config field 'api_key' is required!");
    process.exit(1);
  }
  if (!config.email) {
    console.error("The config field 'email' is required!");
    process.exit(1);
  }
  module.exports = { config };

} catch {
  console.error("Could not read config data, please make sure to create a valid 'config.json' file!");
  process.exit(1);
}
