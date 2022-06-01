import chalk from "chalk";
import columnify from "columnify";
import commandLoader from "./commandLoader.mjs";
import remap from "./remap.mjs";
import _ from "lodash";
import { getLocalPackage } from 'utils/getLocalPackage.mjs';
import boxen from "boxen";

export const ShowHelp = Symbol.for('ShowHelp');

export async function printHelp(module, fsItem, context) {

    const cmdCharOffset = (' > fs ' + context.commandTokens.join(' ')).length - 1;

    await printHeader(module, fsItem, context);
    await printAvailableCommands(context, cmdCharOffset);
    await printAvailableOptions(module, fsItem, context);
    await printFooter(module, fsItem, context);
}

async function printHeader(module, fsItem, context) {
    console.log();
    console.group();

    if (context.error) {
        console.log(chalk.red(context.error.message), '\n');
    }

    if (module && module.help && context.help) {
        console.log(boxen(module.help));
        console.log();
    }

    const tokens = context.commandTokens.map(t => {
        if (t === context.commandName && context.error) return chalk.red(t);
        if (t === context.commandName) {
            return chalk.white(t);
            //return chalk.rgb(255, 128, 0)(t);
        }
        return t;
    });

    console.log(
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

        // console.log(chalk.white('Flags'), '\n');

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

        console.log(columnify(data, { columns: ['alias', 'type', 'default', 'description'], showHeaders: false }));

        console.groupEnd();
        console.log();
    }
    
}

async function printAvailableCommands(context, cmdCharOffset) {
    const modules = await Promise.all(
        Object.values(context.commands)
            .map(c => {
                return commandLoader.load(c, context);
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

    const prefix = '\u0020'.repeat(cmdCharOffset);

    console.log('\u0020'.repeat(cmdCharOffset + 1), chalk.gray('\u2193'));

    console.group();

    for (let g of groups) {

        const data = modules
            .filter(m => m.group === g)
            .map(m => ({
                command: prefix + chalk.yellow(m.command.padEnd(10, ' ')),
                options: Object.values(m.options || {}).map(o => {
                    return [
                        '--',
                        o.alias,
                        ...[o.default !== undefined ? ' ' + chalk.hex('#55ddff')(o.default.toString()) : null]
                    ].join('');
                }).join(' ')
            }));

        console.log(columnify(data, { showHeaders: false }));
        console.log();
    }

    console.groupEnd();
}
