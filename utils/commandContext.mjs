import chalk from "chalk";
import fs from 'fs';
import path from "path";
import commandLoader from "./commandLoader.mjs";
import toDictionary from "./toDictionary.mjs";

export function loadAvailableCommands(context) {
    const pathToSubsommands = context.commandName === 'fs' 
        ? context.currentPath
        : path.join(context.currentPath, context.commandName, 'commands');

    const allFiles = commandLoader.getFiles(pathToSubsommands);
    const commands = toDictionary(allFiles, (cmd) => cmd.name);
    return commands;
}

export function loadCommand(context) {
    const filePath = path.join(
        context.currentPath, 
        context.commandName + '.mjs'
    );
    if (fs.existsSync(filePath)) {
        return commandLoader.getFile(context.currentPath, context.commandName);
    }
}

const _validFlags = [ '--help' ];
export function parseCommandContext(parentContext, depth, args) {
    
    const context = {
      depth,
      args: args || parentContext.args,
      commandTokens: [],
      currentPath: path.resolve('commands'),
      commandName: undefined,
      command: undefined,
      parentCommand: undefined,
      commands: {},
      tail: undefined,
      flags: {},
      error: undefined,
      loadModule() { 
        return commandLoader.load(context.command, context);
      }, 
      argv: undefined, // will be merged by handler
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
        ? context.commandTokens[depth]
        : 'fs'; // root  command

    context.command = loadCommand(context);
    if (!context.command) {
        context.error = { 
            message: 'Invalid command: ' + context.commandName 
        };
    }
    
    // load available commands for the context
    const isRootCommand = context.tail === undefined && context.commandName === 'fs';
    const isTailCommand = context.tail !== undefined && context.commandName === context.tail
    if (isRootCommand || isTailCommand) {
        context.commands = loadAvailableCommands(context)
    }
    
    if (parentContext) {
        context.depth = parentContext.depth + 1;
        context.commandTokens = parentContext.commandTokens;
        context.parentCommand = parentContext.command;
        context.currentPath = path.join(
            parentContext.currentPath, 
            context.commandName
        );
    }

    return context;
  }
  
  
