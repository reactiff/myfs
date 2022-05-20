import fs from "fs";
import path from "path";
import { parseCommandContext, printCommandHelp, printHelp } from "./commandContext.mjs";
import inspectErrorStack from "./inspectErrorStack.mjs";
import FSItem from "./myfs/fsItem.mjs";

function list(abspath) {



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

function createCommandModule({ context, m, name, fsitem }) {
  return {
    command: name,
    type: m.type,
    options: m.options,
    help: m.help,
    handler: (argv) => {
      return new Promise(resolve => {
        try {

          if (context.commandName===context.tail && context.flags.help) {
            // const newContext = parseCommandContext(context.depth + 1, context.args);
            printCommandHelp(m, fsitem, context);
            resolve();
          }

          m.execute(
            argv._.slice(1), 
            argv, 
            resolve, 
            fsitem, 
            context,
          ).catch(inspectErrorStack);
        } catch (err) {
          inspectErrorStack(err);
        }
      });
    },
  };
}

function createFsItem(command) {
  return new FSItem({
    path: command.path,
    name: command.name,
    moduleName: command.filename.replace(/\.mjs$/, ""),
    fullPath: command.fullPath,
  });
}

function load(context) {
  return new Promise(resolve => {
    // it shoud work because of workspaces
    import(context.command.pathFromRoot)
      .then(m => {
        const fsitem = createFsItem(context.command);
        resolve(createCommandModule({ 
          context,
          m, 
          name: fsitem.moduleName, 
          fsitem 
        }));
      })
      .catch(ex => {
        inspectErrorStack(ex)
      });
  });
}

function loadAll(abspath) {

  return new Promise((resolve, reject) => {
    const commands = list(abspath);
    Promise.all(
      commands.map((c) => {
        return load(c);
      })
    )
    .then(resolve)
    .catch((err) => {
      inspectErrorStack(err);
      reject(err.message || err);
    });
  });
}

export default {
  list,
  load,
  loadAll,
};
