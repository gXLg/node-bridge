const { spawn, spawnSync } = require("child_process");

const jobs = [];

function start(start, stop, cwd, port) {
  const [cmd, ...argsr] = start;
  const args = argsr.map(a => a.replaceAll("{port}", port));
  // start in background
  jobs.push([spawn(cmd, args, { cwd }), stop, cwd]);
}

process.on("SIGINT", () => jobs.forEach(j => {
  const [job, stop, cwd] = j;
  if (stop == null) {
    job.kill("SIGINT");
    return;
  }
  const [cmd, ...argsr] = stop;
  const args = argsr.map(a => a.replaceAll("{pid}", job.pid));
  // wait until finished
  spawnSync(cmd, args, { cwd });
}));

module.exports = { start };
