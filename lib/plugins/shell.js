function apply(config) {
  config.run = ["sh", "-c", config.run];
}

module.exports = { apply };
