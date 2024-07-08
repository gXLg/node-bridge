const { spawn } = require("child_process");

const jobs = [];

function start(command, cwd, port) {
  const [cmd, ...argsr] = command;
  const args = argsr.map(a => a.replaceAll("{port}", port));
  jobs.push(spawn(cmd, args, { cwd }));
}

process.on("SIGINT", () => jobs.forEach(j => j.kill("SIGINT")));

module.exports = { start };
