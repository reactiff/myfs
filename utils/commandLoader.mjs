import fs from "fs";
import path from "path";
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

function createCommandModule({ m, name, fsitem }) {
  return {
    command: name,
    options: m.options,
    help: m.help,
    handler: (argv) => {
      return new Promise(resolve => {
        try {
          m.execute(argv._.slice(1), argv, resolve, fsitem)
            .catch(inspectErrorStack);
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

function load(command) {
  return new Promise(resolve => {
    import(command.pathFromRoot)
      .then(m => {
        const fsitem = createFsItem(command);
        resolve( createCommandModule({ m, name: fsitem.moduleName, fsitem }));
      })
      .catch(inspectErrorStack);
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
