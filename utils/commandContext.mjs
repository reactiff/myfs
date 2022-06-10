import chalk from "chalk";
import fs from 'fs';
import path from "path";
import { getProgramDirectory } from "../bin/getProgramDirectory.mjs";
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
        
    // TODO

    // If command has positional arguments then it is the tail command

    const tracer = new Tracer('parseCommandContext').enter();
    const pctx = parentContext;
    const __progDir = getProgramDirectory();


    const context = {
      depth: pctx ? pctx.depth + 1 : depth,
      args: pctx ? pctx.args : args,
      commandTokens: pctx ? pctx.commandTokens : [],
      parentCommand: pctx ? pctx.command : undefined,
      // 
      argv: undefined, // will be merged by handler
      currentPath: path.resolve(__progDir, 'commands'),
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
    
    const __commandName__ = context.args.length > 0 
        ? context.args[context.depth]
        : 'fs'; // root  command;

    // get current command name
    context.commandName = __commandName__;

    // update current path before loading command files
    if (pctx) {
        context.currentPath = path.join(pctx.currentPath, pctx.commandName, 'commands');
    }
    
    // If the parent command provides a method to get a subcommand, use it.
    // This is how standard subcommands can be implemented for things 
    // like Lists that use the same set of subcommands
    if (pctx && pctx.module && pctx.module.getSubcommand) {
        context.command = pctx.module.getSubcommand(context.commandName);
    } else {
        context.command = loadCommand(context);
    }
    if (!context.command) context.error = { message: 'Invalid command: ' + context.commandName };

    // load command module
    context.module = await commandLoader.loadModule(context.command, context);
    if (context.module.hasArguments) {
        // If command has positional arguments, then it cannot be followed by any other command.
        // Drop all tokens that may follow this command from commandTokens array, which is used to 
        // pass control to the command that follows.
        // ( note that the original commandline tokens including command arguments which the command needs are still preserved in the args array )
        context.commandTokens = context.commandTokens.slice(0, context.depth + 1);
    }
  
    ////////////////////////////////////////////////////////////////////////// BEGIN RESTRICTED SECTION
    // NOTE: THIS ONLY RUNS ON THE FIRST CYCLE OF INVOKATION OF THIS FUNCTION.
    // 
    // - ON FIRST RUN:          ARGS PARAMETER IS PROVIDED 
    //
    // - ON RECURSIVE CALLS:    CONTEXT OBJECT IS PASSED AND CLONED, PRESERVING 
    //                          THE RESULTS OF THIS OPERATION.
    //
    // -----------------------------------------
    // Collect command tokens (up to first flag)
    if (args) {
        for (let i = 0; i < args.length; i++) {
            const token = args[i] 
            // break if found an option switch
            if (token.startsWith('-')) break;
            // break current command has arguments and the token index is greater than current command index (depth)
            if (context.module.hasArguments && i > context.depth) break;
            context.commandTokens.push(token);
        }
    }
    ////////////////////////////////////////////////////////////////////////// END RESTRICTED SECTION
    
    // get the tail (last command)
    context.tail =  context.commandTokens.length > 0 
        ? context.commandTokens[context.commandTokens.length - 1] 
        : undefined;

    context.flags.help = Boolean(context.args.includes('--help'));

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
  
  
