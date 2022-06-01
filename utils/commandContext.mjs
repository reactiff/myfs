import chalk from "chalk";
import fs from 'fs';
import path from "path";
import commandLoader from "./commandLoader.mjs";
import toDictionary from "./toDictionary.mjs";
import { Tracer } from "./Tracer.mjs";

function getPathToCurrentCommand(context)  {
    return context.commandName === 'fs' 
        ? context.currentPath
        : path.join(context.currentPath, context.commandName, 'commands');
}

function getPathToNextCommands(context)  {
    return context.commandName === 'fs' 
        ? context.currentPath
        : path.join(context.currentPath, context.commandName, 'commands');
}

export function loadAvailableCommands(context) {
    const p = getPathToNextCommands(context);
    const allFiles = commandLoader.getFiles(p);
    const commands = toDictionary(allFiles, (cmd) => cmd.name);
    return commands;
}

export function loadCommand(context) {
    if (fs.existsSync(path.join(context.currentPath, context.commandName + '.mjs'))) {
        return commandLoader.getFile(context.currentPath, context.commandName);
    }
}

export async function parseCommandContext(parentContext, depth, args) {
        
    const tracer = new Tracer('parseCommandContext').enter();

    const pctx = parentContext;

    const context = {
      depth: pctx ? pctx.depth + 1 : depth,
      args: pctx ? pctx.args : args,
      commandTokens: pctx ? pctx.commandTokens : [],
      parentCommand: pctx ? pctx.command : undefined,
      // 
      argv: undefined, // will be merged by handler
      currentPath: path.resolve('commands'),
      commandName: undefined,
      command: undefined,
      commands: {},
      tail: undefined,
      flags: {},
      error: undefined,
      module: undefined,
      
      getAvailableCommands(module) {
        if (module && module.getAvailableCommands) {
            return module.getAvailableCommands(context);
        } else {
            return loadAvailableCommands(context)
        }
      }
    };
    
    context.flags.help = Boolean(context.args.includes('--help'));

    // collect command tokens (up to first flag)
    if (args) {
        for (let token of args) {
            if (token.startsWith('-')) break;
            context.commandTokens.push(token);
        }
    }
    
    // get the tail (last command)
    context.tail =  context.commandTokens.length > 0 
        ? context.commandTokens[context.commandTokens.length - 1] 
        : undefined;

    // get current command name
    context.commandName = context.commandTokens.length > 0 
        ? context.commandTokens[context.depth]
        : 'fs'; // root  command

    
    // update current path before loading command files
    if (pctx) {
        context.currentPath = path.join(pctx.currentPath, pctx.commandName, 'commands');
    }

    // if the parent command can provide the command handler, use that.
    // this is how standard subcommands can be implemented for things 
    // like Lists that use the same set of subcommands
    if (pctx && pctx.command && pctx.command.getNextCommand) {
        debugger
        context.command = pctx.command.getNextCommand(context);
    } else {
        context.command = loadCommand(context);
    }
    
    if (!context.command) {
        context.error = { 
            message: 'Invalid command: ' + context.commandName 
        };
    }
    
    debugger
    context.module = commandLoader.load(context.command, context);
      

    // load available commands for the context
    // const isRootCommand = context.tail === undefined && context.commandName === 'fs';
    // const isTailCommand = context.tail !== undefined && context.commandName === context.tail
    // if (isRootCommand || isTailCommand) {

    //     if (pctx && pctx.command && pctx.command.getAvailableCommands) {
    //         debugger
    //         context.commands = pctx.command.getAvailableCommands(context);
    //     } else {
    //         context.commands = loadAvailableCommands(context)
    //     }
        
    // }
    
    tracer.exit();

    return context;
  }
  
  
