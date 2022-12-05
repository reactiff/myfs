import chalk from "chalk";
import { printToConsole } from "./printToConsole.mjs";

const rethrow = (ex) => { 
    
    console.error(chalk.red(ex.message || ex))

    const stack = ex.stack && ex.stack.split('\n');
    stack && stack.slice(1)
        .forEach(line => {
            printToConsole(chalk.gray(line));
        })
      
    throw new Error(ex.message) 
};

export default rethrow;