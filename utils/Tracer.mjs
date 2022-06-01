import chalk from "chalk";

// debugging and call tracing
export class Tracer {
    constructor(name) {
      this.name = name;
    }
    enter() {
      console.group(chalk.yellow('>>'), chalk.green(this.name));
      return this;
    }
    exit(...data) {
      if (data && data.length) {
        for (let d of data) {
          console.log(d);
        }
      }
      console.log(chalk.magenta('<<'), chalk.red(this.name));
      console.groupEnd();
      return this;
    }
    log(...data) {
        if (data && data.length) {
          for (let d of data) {
            console.log(d);
          }
        }
        return this;
      }
  }
  