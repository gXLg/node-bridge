function apply(config) {
  config.run = ["npx", "nodemon", "-w", "index.js", ".", "{port}"];
}

module.exports = { apply };
