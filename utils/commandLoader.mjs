import chalk from "chalk";
import fs from "fs";
import path from "path";
import { getProgramDirectory } from "../bin/getProgramDirectory.mjs";
import { ShowHelp, printHelp } from "./help.mjs";
import inspectErrorStack from "./inspectErrorStack.mjs";
import FSItem from "./myfs/fsItem.mjs";

function loadModule(command, context) {
  return new Promise(resolve => {
    
    // check if command is already a module (such as a subcommand provided directly by the previous command in chain)
    if (command[Symbol.for("type")] === "module") {
      const m = command;
      resolve({
        ...command,
        handler: commandHandler({ context, m }), // inject the handler here
      });
      return;
    }
    
    const relative = command.importPath.replace("\\", "/") + '.mjs';

    import(relative)
      .then(m => {
        const fsitem = createFsItem(command);
        const module = createCommandModule({ context, m, fsitem });
        console.log(chalk.hex('#ffaa00')(' ... < resolved module ' + relative));
        resolve(module);
      })
      .catch(ex => {
        debugger // ERROR
        inspectErrorStack(ex)
      });
  });
}

function createFsItem(command) {
  return new FSItem({
    path: command.path,
    name: command.name,
    moduleName: command.filename.replace(/\.mjs$/, ""),
    fullPath: command.fullPath,
  });
}

function createCommandModule({ context, m, fsitem }) {

  const command = (m.command || fsitem.moduleName).trim();
  const spacePos = command.indexOf(' ');
  const [ cmdName, cmdArgs ] = spacePos >= 0 
    ? [ command.slice(0, spacePos), command.slice(spacePos).trim() ]
    : [ command, '' ];

  return {
    command,
    name: cmdName,
    hasArguments: cmdArgs.length > 0,
    arguments: cmdArgs,
    options: m.options || {},
    help: m.desc,
    group: m.group,
    getSubcommand: m.getSubcommand,
    getAvailableCommands: m.getAvailableCommands,
    // yargs calls handler
    handler: commandHandler({ context, m, fsitem }),
  };
}

/////////////////////////////////////////////////////////////////////////// COMMAND HANDLER
function commandHandler({context, m, fsitem}) {
  return (argv) => {
    return new Promise(resolve => {
      try {

        // if --help is for this command
        if (context.commandName===context.tail && context.flags.help) {
          printHelp(m, fsitem, context);
          resolve();
          return;
        }

        m.execute(Object.assign(context, { argv }))
          .then(async (result) => {
            if (result === ShowHelp) {
              // this means command not found or missing options, display usage
              await printHelp(m, fsitem, context);
            }
            resolve();
          })
          .catch(err => {
            inspectErrorStack(err)
          });

      } catch (err) {
        inspectErrorStack(err);
      }
    });
  }
}

// MULTIPLE MODULES

function loadAll(abspath) {
  return new Promise((resolve, reject) => {
    Promise.all( getFiles(abspath).map((c) => loadModule(c)) )
    .then(resolve)
    .catch((err) => {
      inspectErrorStack(err);
      reject(err.message || err);
    });
  });
}


function getFiles(abspath) {
  if (!fs.existsSync(abspath)) return [];
  const __progDir = getProgramDirectory();
  let dirItems = fs.readdirSync(abspath);
  let commands = [];
  for (let file of dirItems) {
    if (file.endsWith(".mjs")) {
      const fullPath = path.join(abspath, file);
      const name = file.slice(0, file.length - ".mjs".length);
      const importPath = path.join(abspath, name).replace(__progDir + "\\", "").replace("\\", "/");
      commands.push({
        name: file.slice(0, file.length - ".mjs".length),
        filename: file,
        path: abspath,
        fullPath,
        importPath,
      });
    }
  }
  return commands;
}


function getFile(abspath, commandName) {
  const __progDir = getProgramDirectory();
  const filename = commandName + '.mjs';
  const fullPath = path.join(abspath, commandName + '.mjs');
  const importPath = path.join(abspath, commandName).replace(__progDir + "\\", "").replace("\\", "/");
  return {
    name: commandName,
    filename,
    path: abspath,
    fullPath,
    importPath,
  }
}


export default {
  getFile,
  getFiles,
  loadModule,
  loadAll,
};
