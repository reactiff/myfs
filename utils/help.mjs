import chalk from "chalk";
import columnify from "columnify";
import commandLoader from "./commandLoader.mjs";
import remap from "./remap.mjs";
import _ from "lodash";
import { getLocalPackage } from 'utils/getLocalPackage.mjs';
import boxen from "boxen";
import { Tracer } from "./Tracer.mjs";
import { printToConsole } from "./printToConsole.mjs";

export const ShowHelp = Symbol.for('ShowHelp');

export async function printHelp(module, fsItem, context) {

    const tracer = new Tracer('printHelp').enter();

    const cmdCharOffset = (' > fs ' + context.commandTokens.join(' ')).length - 1;

    await printHeader(module, fsItem, context);
    await printAvailableCommands(module, context, cmdCharOffset);
    await printAvailableOptions(module, fsItem, context);
    await printFooter(module, fsItem, context);
}

async function printHeader(module, fsItem, context) {
    printToConsole();
    console.group();

    if (context.error) {
        printToConsole(chalk.red(context.error.message), '\n');
    }

    if (module && module.desc && context.flags.help) {
        printToConsole(boxen(module.desc));
        printToConsole();
    }

    const tokens = context.commandTokens.map(t => {
        if (t === context.commandName && context.error) return chalk.red(t);
        if (t === context.commandName) {
            return chalk.white(t);
            //return chalk.rgb(255, 128, 0)(t);
        }
        return t;
    });

    printToConsole(
        chalk.white(
            '> fs ' + 
            tokens.join(' ')
        ),  
        chalk.yellow('...'),
        chalk.cyan('[options]')
    );
}

async function printFooter(module, fsItem, context) {
    console.groupEnd();
}

async function printAvailableOptions(module, fsItem, context) {
    if (!module) return;
    if (module.options) {

        // printToConsole(chalk.white('Flags'), '\n');

        console.group();

        const data = Object.values(
            remap(module.options, {
                value: (v, k) => ({
                    ...v,
                    alias: chalk.white(`--${v.alias}`),
                    default: v.default !== undefined ? chalk.hex('#55ddff')(v.default) : '',
                    type: chalk.green(v.type),
                    description: chalk.gray(v.description)
                })
            })
        );

        printToConsole(columnify(data, { columns: ['alias', 'type', 'default', 'description'], showHeaders: false }));

        console.groupEnd();
        printToConsole();
    }
    
}

async function printAvailableCommands(module, context, cmdCharOffset) {

    const commands = context.getAvailableCommands(module);
    const modules = await Promise.all(
        Object.values(commands).map(c => {
            // if (c[Symbol.for('type')] === 'module') return c;
            return commandLoader.loadModule(c, context);
        })
    ).catch((reason) => console.error(reason.message || reason));

    const groupOrder = {
        'File Search': 0,
        'File Search Results': 1,
        'Filtering': 2,
        'Utils': 3,
    };

    const groupSet = new Set(modules.filter(m => m.group !== 'Root').map(m => m.group));
    const groups = _.sortBy(
        Array.from(groupSet),
        [g => groupOrder[g] || 1]
    );

    // const prefix = '\u0020'.repeat(cmdCharOffset);
    printToConsole('\u0020'.repeat(cmdCharOffset + 1), chalk.gray('\u2193'));

    // calculate maximum length for each printed column
    const colWidth = { 
        cmdName: modules.reduce((longest, m) => Math.max(longest, m.name.length), 0),
        arguments: modules.reduce((longest, m) => Math.max(longest, (m.arguments||'').length), 0),
        options: modules.reduce((longest, m) => Math.max(longest, (m.options||'').length), 0),
    };
        
    console.group();

    for (let g of groups) {

        const data = modules
            .filter(m => m.group === g)
            .map(m => ({
                command: chalk.yellow(m.name.padEnd(colWidth.cmdName, ' ')),
                arguments: m.arguments ? chalk.gray(m.arguments.padEnd(colWidth.arguments, ' ')) : '',
                options: Object.values(m.options || {}).map(o => {
                    return [
                        '--',
                        o.alias,
                        ...[o.default !== undefined ? ' ' + chalk.hex('#55ddff')(o.default.toString()) : null]
                    ].join('');
                }).join(' ')
            }));

        printToConsole(columnify(data, { showHeaders: false }));
        printToConsole();
    }

    console.groupEnd();
}
