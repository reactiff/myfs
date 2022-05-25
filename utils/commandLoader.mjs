import fs from "fs";
import path from "path";
import { printCommandHelp, printHelp } from "./help.mjs";
import inspectErrorStack from "./inspectErrorStack.mjs";
import FSItem from "./myfs/fsItem.mjs";

function load(command, context) {
  return new Promise(resolve => {
    // it shoud work because of workspaces
    import(command.pathFromRoot)
      .then(m => {
        const fsitem = createFsItem(command);
        resolve(
          createCommandModule({ 
            context,
            m, 
            name: fsitem.moduleName, 
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

function createCommandModule({ context, m, name, fsitem }) {
  return {
    command: name,
    type: m.type,
    options: m.options || {},
    help: m.help,
    group: m.group,
    // yargs calls handler
    handler: handleCommand({ context, m, name, fsitem }),
  };
}

function handleCommand({context, m, name, fsitem}) {
  return (argv) => {
    return new Promise(resolve => {
      try {

        // if --help is for this command
        if (context.commandName===context.tail && context.flags.help) {
          printCommandHelp(m, fsitem, context);
          resolve();
        }

        m.execute(argv._.slice(1), argv, resolve, fsitem, context).catch(
          inspectErrorStack
        );

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
