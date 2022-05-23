import chalk from "chalk";
import columnify from "columnify";
import path, { resolve } from "path";
import { fileURLToPath } from "url";
import commandLoader from "./commandLoader.mjs";
import remap from "./remap.mjs";
import toDictionary from "./toDictionary.mjs";
import _ from "lodash";

import { getLocalPackage } from 'utils/getLocalPackage.mjs'
import boxen from "boxen";

export function getContextPath(context, chain) {
    const partialTokens = chain.slice(0, context.depth);
    const relativePath = [ 'commands', ...partialTokens ].join('/');
    const _path = path.resolve(
        global.__basedir, 
        relativePath
    );
    return _path;
}   

export function loadContextCommands(context, chain) {
    const pathToContext = getContextPath(context, chain)
    const items = commandLoader.getFiles(pathToContext);
    const commands = toDictionary(items, (cmd) => cmd.name);
    return commands;
}

export function printCommandHelp(module, fsItem, context) {

    console.log();

    console.group();

    const rawTitle = fsItem.name + ' HELP';
    console.log(chalk.rgb(255,128,0)(fsItem.name.toUpperCase()), 'HELP');
    console.log(chalk.gray('-'.repeat(rawTitle.length)));
    
    // show module description
    console.log(module.help);

    console.log();
    
    console.log(boxen(chalk.bold.white('> fs ' + (context.args.join(' ') + ' ' + chalk.bgHex('#000')(' ... ') + ' '))));

    console.log();

    console.group();
    if (module.options) {
        const data = Object.values(
            remap(module.options, {
                value: (v, k) => ({ 
                    ...v, 
                    alias: chalk.white(`--${v.alias}` + ' ' + v.alias ),
                    default: v.default !== undefined ? chalk.hex('#55ddff')(v.default) : '',
                    type: chalk.green(v.type),
                    description: chalk.gray(v.description)
                })
            })
        );
        console.log(columnify(data, { columns: [ 'alias', 'type', 'default', 'description' ], showHeaders: false }));
    }
    console.groupEnd();
    
    console.log();

    console.groupEnd();
    process.exit();
}

export function printHelp(context) {
        
    console.log();

    console.group();

    const pkg = getLocalPackage();

    const rawTitle = pkg.name.toUpperCase();
    console.log(rawTitle + ' - ' + chalk.grey(pkg.author + ', ' + pkg.license + ', ' + 'v' + pkg.version));

    const combinedTitle = rawTitle + ' - ' + pkg.author + ', ' + pkg.license + ', ' + 'v' + pkg.version;
    console.log(chalk.gray('-'.repeat(combinedTitle.length)));
        
    console.log();

    // show module description
    console.log(pkg.description);

    console.log();

    console.log('> fs ... ');

    console.log();

    console.group();

    Promise.all(
        Object.values(context.commands)
            .map(c => {
                return commandLoader.load(c, context)
            })
    ).then(modules => {

        const groupOrder = { 
            'File System': 0,
            'List Management': 1,
            'Notes': 2,
            'Web Apps': 3,
            'Settings': 999
        };

        const groupSet = new Set(modules.map(m => m.group));
        const groups = _.sortBy(
            Array.from(groupSet), 
            [ g => groupOrder[g] || 1 ]
        );

        for (let g of groups) {
            
            const groupTitle = g||"ungrouped";
            console.log( chalk.underline.gray(groupTitle)) ;
            // console.log('-'.repeat(groupTitle.length));
            console.log();

            console.group();

            const data = modules
                .filter(m => m.group === g)
                .map(m => ({
                    command: '\t' + chalk.yellow(m.command.padEnd(10, ' ')), 
                    options: Object.values(m.options||{}).map(o => {
                        return [
                        '--', 
                        o.alias, 
                        ...[o.default !== undefined ? ' ' + chalk.hex('#55ddff')(o.default.toString()) : null]
                        ].join('');
                    }).join(' ')
                }));
            
            console.log(columnify(data, { showHeaders: false }));
            console.groupEnd();
            console.log();
        }
        
        console.groupEnd();

    })
    .catch((reason) => {
        console.error(reason.message || reason)
    })

}

const _validFlags = [ '--help', '--status' ];
export function parseCommandContext(depth, chain) {

    const context = {
      depth,
      flagCount: 0,
      flags: {},
      commandName: '',
      args: [],
      commands: {},
      command: undefined,
      tail: undefined,
      loadModule() {
        return commandLoader.load(context.command, context);
      }
    };

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
    for (let token of chain) {
        if (processFlag(token)) continue;
        context.args.push(token);
    }

    // get the tail (last command)
    context.tail =  context.args.length > 0 
        ? context.args[context.args.length - 1] 
        : undefined;

    // load available commands for the context
    context.commands = loadContextCommands(context, chain)
    
    if (chain.length > depth) {
        // get the command
        context.commandName = chain[depth];
        context.command = context.commands[context.commandName];
    }
    
    return context;
  }
  
  
