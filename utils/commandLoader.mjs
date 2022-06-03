import chalk from "chalk";
import fs from "fs";
import path from "path";
import { ShowHelp, printHelp } from "./help.mjs";
import inspectErrorStack from "./inspectErrorStack.mjs";
import FSItem from "./myfs/fsItem.mjs";

function load(command, context) {
  return new Promise(resolve => {
    // it shoud work because of workspaces

    if (!command) debugger
    
    import(command.pathFromRoot)
      .then(m => {
        
        const fsitem = createFsItem(command);
        resolve(
          createCommandModule({ 
            context,
            m, 
            fsitem 
          })
        );
      })
      .catch(ex => {
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
    ? [ command.slice(0, spacePos), command.slice(spacePos) ]
    : [ command, '' ];

  return {
    command,
    name: cmdName,
    arguments: cmdArgs,
    options: m.options || {},
    help: m.desc,
    group: m.group,
    getNextCommand: m.getNextCommand,
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
    Promise.all( getFiles(abspath).map((c) => load(c)) )
    .then(resolve)
    .catch((err) => {
      inspectErrorStack(err);
      reject(err.message || err);
    });
  });
}


function getFiles(abspath) {
  if (!fs.existsSync(abspath)) return [];
  let dirItems = fs.readdirSync(abspath);
  let commands = [];
  for (let file of dirItems) {
    if (file.endsWith(".mjs")) {
      const fullPath = path.join(abspath, file);
      commands.push({
        name: file.slice(0, file.length - ".mjs".length),
        filename: file,
        path: abspath,
        fullPath,
        // eslint-disable-next-line no-undef
        pathFromRoot: fullPath
          .replace(global.__basedir + "\\", "")
          .replace("\\", "/"),
      });
    }
  }
  return commands;
}


function getFile(abspath, commandName) {
  const filename = commandName + '.mjs';
  const fullPath = path.join(abspath, commandName + '.mjs');
  return {
    name: commandName,
    filename,
    path: abspath,
    fullPath,
    // eslint-disable-next-line no-undef
    pathFromRoot: fullPath
      .replace(global.__basedir + "\\", "")
      .replace("\\", "/"),
  }
}


export default {
  getFile,
  getFiles,
  load,
  loadAll,
};
