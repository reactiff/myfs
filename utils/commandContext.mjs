import chalk from "chalk";
import fs from 'fs';
import path from "path";
import commandLoader from "./commandLoader.mjs";
import toDictionary from "./toDictionary.mjs";

// export function getPath(context, chain) {
//     const partialTokens = chain.slice(0, context.depth);
//     const relativePath = path.join(['commands', ...partialTokens ]);
//     const _path = path.resolve(
//         global.__basedir, 
//         relativePath
//     );
//     return _path;
// }   

function getCommandPaths(context) {
    const parentCommand = context.parentCommand;
    const parentPath = context.parentCommand 
        ? parentCommand.path 
        : 'commands'; 
    
    const pathFromParent = path.resolve(parentPath);
    const sharedPath = path.resolve('commands/_shared');

    return [
        pathFromParent,
        sharedPath,
    ]
}

export function loadAvailableCommands(context) {

    debugger

    const paths = getCommandPaths(context);
    const allFiles = paths.reduce(
        (files, p) => files.concat(...commandLoader.getFiles(p))
    , []);

    const commands = toDictionary(allFiles, (cmd) => cmd.name);
    return commands;
}

export function loadCommand(context) {

    debugger
    
    const paths = getCommandPaths(context);

    for (let p of paths) {
        if (fs.existsSync(path.join(p, context.commandName + '.mjs'))) {
            return commandLoader.getFile(p, context.commandName);
        }
    }
}

const _validFlags = [ '--help', '--status' ];
export function parseCommandContext(parentContext, depth, args) {
    
    debugger

    const context = {
      depth,
      args: [],
      currentPath: path.resolve('commands'),
      commandName: '',
      command: undefined,
      parentCommand: undefined,
      commands: {},
      tail: undefined,
      flagCount: 0,
      flags: {},
    };

    if (parentContext) {
        context.depth = parentContext.depth + 1;
        context.args = parentContext.args;
        context.currentPath = parentContext.currentPath;
        context.parentCommand = parentContext.command;
    }
    
    context.loadModule = () => { 
        return commandLoader.load(context.command, context);
    }
    

    // command/flag partitioner
    const processFlag = (token) => {
      if (_validFlags.includes(token)) {
        const flag = token.replace(/--/g, '');
        context.flags[flag] = true;
        context.flagCount++;
        return true;
      }
      if (context.flagCount) {
        console.log(chalk.bgRed.white('Only flags can follow flags'));
        process.exit();
      }
    }

    // main token iterator
    if (!parentContext) {
        for (let token of args) {
            if (processFlag(token)) continue;
            context.args.push(token);
        }
    }
    
    // get the tail (last command)
    context.tail =  context.args.length > 0 
        ? context.args[context.args.length - 1] 
        : undefined;

    if (context.args.length > context.depth) {
        // get the command
        context.commandName = context.args[depth];
        context.command = loadCommand(context);
        context.currentPath = context.command.path;
    }
    
    // load available commands for the context
    if (context.commandName===context.tail && context.flags.help) {
        context.commands = loadAvailableCommands(context)
    }
    
    return context;
  }
  
  
