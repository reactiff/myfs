import chalk from "chalk";
import columnify from "columnify";
import commandLoader from "./commandLoader.mjs";
import remap from "./remap.mjs";
import _ from "lodash";
import { getLocalPackage } from 'utils/getLocalPackage.mjs';
import boxen from "boxen";


export function printHelp(module, fsItem, context) {

    printHeader(module, fsItem, context);

    printAvailableCommands(context);
    printAvailableOptions(module, fsItem, context);

    printFooter(module, fsItem, context);
}

function printHeader(module, fsItem, context) {
    console.log();
    console.group();
    // const rawTitle = fsItem.name + ' HELP';
    // console.log(chalk.rgb(255, 128, 0)(fsItem.name.toUpperCase()), 'HELP');
    // console.log(chalk.gray('-'.repeat(rawTitle.length)));
    // show module description
    console.log(module.help);
    console.log();

    const tokens = context.args.map(t => t === fsItem.name ? chalk.rgb(255, 128, 0)(t) : t);

    console.log(
        // boxen(
            chalk.bold.bgBlack.white('> fs ' + (tokens.join(' ') + ' ... ' + ' '))
        // , { backgroundColor: '#000', margin: 0, padding: 0, borderColor: 'transparent' } )
    );
    console.log();
}

function printFooter(module, fsItem, context) {
    console.groupEnd();
}

function printAvailableOptions(module, fsItem, context) {
    if (module.options) {
        const data = Object.values(
            remap(module.options, {
                value: (v, k) => ({
                    ...v,
                    alias: chalk.white(`--${v.alias}` + ' ' + v.alias),
                    default: v.default !== undefined ? chalk.hex('#55ddff')(v.default) : '',
                    type: chalk.green(v.type),
                    description: chalk.gray(v.description)
                })
            })
        );
        console.log(columnify(data, { columns: ['alias', 'type', 'default', 'description'], showHeaders: false }));
    }
    console.log();
}

function printAvailableCommands(context) {
    Promise.all(
        Object.values(context.commands)
            .map(c => {
                return commandLoader.load(c, context);
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
            [g => groupOrder[g] || 1]
        );

        for (let g of groups) {

            const groupTitle = g || "ungrouped";
            console.log(chalk.underline.gray(groupTitle));
            // console.log('-'.repeat(groupTitle.length));
            console.log();

            console.group();

            const data = modules
                .filter(m => m.group === g)
                .map(m => ({
                    command: '\t' + chalk.yellow(m.command.padEnd(10, ' ')),
                    options: Object.values(m.options || {}).map(o => {
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
            console.error(reason.message || reason);
        });

}
