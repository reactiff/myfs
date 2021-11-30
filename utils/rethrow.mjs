import chalk from "chalk";

const rethrow = (ex) => { 
    
    console.error(chalk.red(ex.message || ex))

    const stack = ex.stack && ex.stack.split('\n');
    stack && stack.slice(1)
        .forEach(line => {
            console.log(chalk.gray(line));
        })
      
    throw new Error(ex.message) 
};

export default rethrow;