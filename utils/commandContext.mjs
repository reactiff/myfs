import chalk from "chalk";
import columnify from "columnify";
import path from "path";
import { fileURLToPath } from "url";
import commandLoader from "./commandLoader.mjs";
import remap from "./remap.mjs";
import toDictionary from "./toDictionary.mjs";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

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
    const items = commandLoader.list(pathToContext);
    const commands = toDictionary(items, (cmd) => cmd.name);
    return commands;
}

export function printCommandHelp(module, fsItem) {
    
    console.log(chalk.rgb(255,128,0)(fsItem.name + ' help:')); 

    if (module.help) {
        console.log(module.help);
    }

    console.log();

    if (module.options) {

        const data = Object.values(
            remap(module.options, {
                value: (v, k) => ({ ...v, key: `-${k}`, alias: `--${v.alias}` })
            })
        );

        console.log(columnify(data));

        // // calculate longest alias
        // const aliases = Object.values(module.options)
        //     .map(o => {
        //         const d = o.default;
        //         const defaultStr = (d !== undefined ? '=' + d.toString() : '');
        //         return '--' + o.alias + defaultStr;
        //     });

        // debugger
        // const longestAlias = aliases.reduce((a, s) => Math.max(a, s.length), 0);
        
        // for (let k of Object.keys(module.options)) {

        //     const o = module.options[k];

        //     const description = o.description;
        //     const type = o.type;
        //     const defaultValue = o.default;
            
        //     const defaultStr = o.default !== undefined 
        //         ? '=' + o.default.toString()
        //         : '';
            
        //     const longForm = [
        //         ('-' + k).padEnd(4),
        //         ('--' + o.alias + defaultStr).padEnd(longestAlias + 1), 
        //     ].join('');

        //     console.log( 
        //         '',
        //         longForm,
        //         type,
        //         defaultValue,
        //         description,
        //     ) 
            
        // }    
    }

    

    console.log();
    process.exit();
}

export function printHelp(context) {
        
    console.log(chalk.rgb(255,128,0)('Available commands:')); 

    Promise.all(
        Object.values(context.commands)
            .map(c => {
                return commandLoader.load(c)
            })
    ).then(modules => {
    
        for (let m of modules) {
            console.log( 
            chalk.gray(' fs'), 
            chalk.yellow(m.command.padEnd(10, ' ')), 
            ...Object.values(m.options||{}).map(o => {
                return [
                '--', 
                o.alias, 
                ...[o.default !== undefined ? chalk.hex('#8888aa')('=') + chalk.hex('#55ddff')(o.default.toString()) : null]
                ].join('');
            }) 
            );
        }

        console.log();
        process.exit();

    })
    .catch((reason) => {


        debugger

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
        return commandLoader.load(context);
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
  
  
