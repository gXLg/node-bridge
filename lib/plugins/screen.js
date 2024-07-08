function apply(config) {
  const name = "node-bridge (" + config.record + ")";
  config.run = ["screen", "-dmS", name, "--", ...config.run];
  config.stop = ["screen", "-S", name, "-X", "stuff", "^C"];
}

module.exports = { apply };
