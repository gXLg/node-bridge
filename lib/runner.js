const { spawn, spawnSync } = require("child_process");

const jobs = [];

function start(start, stop, cwd, port) {
  const [cmd, ...argsr] = start;
  const args = argsr.map(a => a.replaceAll("{port}", port));
  jobs.push([spawn(cmd, args, { cwd }), stop]);
}

process.on("SIGINT", () => jobs.forEach(j => {
  const [job, stop] = j;
  if (stop == null) {
    job.kill("SIGINT");
    return;
  }
  const [cmd, ...argsr] = stop;
  const args = argsr.map(a => a.replaceAll("{pid}", job.pid));
  spawnSync(cmd, args, { cwd });
}));

module.exports = { start };
