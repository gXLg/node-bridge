const fs = require("fs");

function work(){
  const markov = JSON.parse(fs.readFileSync("lib/namae/markov.json"));
  const keys = Object.keys(markov).filter(k => k[0] == "^");
  let result = keys.at(Math.random() * keys.length);
  while(result.slice(-1) != "$") {
    const ctx = result.slice(-2);
    const probs = markov[ctx];
    const pick = [];
    for(const pre in probs){
      let dis = 1;
      if(pre == "$"){
        if(result.length < 6) dis = 0;
        if(result.length > 10) dis = 4;
      }
      pick.push(
        ...[
          ...Array(Math.floor(probs[pre] * dis))
        ].map(() => pre)
      );
    }
    const next = pick.at(Math.random() * pick.length) ?? "$";
    result += next;
  }
  return result.slice(1, -1);
}

module.exports = work;
