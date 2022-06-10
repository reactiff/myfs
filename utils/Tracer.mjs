import chalk from "chalk";

const TRACING_ENABLED = false;

// debugging and call tracing
export class Tracer {
  constructor(name) {
    this.name = name;
  }
  enter() {
    if (!TRACING_ENABLED) return this;
    //console.group(chalk.yellow('>>'), chalk.green(this.name));
    console.log(chalk.yellow(">>"), chalk.green(this.name));
    return this;
  }
  exit(...data) {
    if (!TRACING_ENABLED) return this;
    if (data && data.length) {
      for (let d of data) {
        console.log(d);
      }
    }
    console.log(chalk.magenta("<<"), chalk.red(this.name));
    // console.groupEnd();
    return this;
  }
  log(...data) {
    if (!TRACING_ENABLED) return this;
    if (data && data.length) {
      for (let d of data) {
        console.log(d);
      }
    }
    return this;
  }
}
