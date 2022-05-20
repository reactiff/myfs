import path from "path";
import fs from "fs";
import chalk from "chalk";
import MyFS from "./myfs.mjs";
import yargs from 'yargs';
import inspectErrorStack from "./inspectErrorStack.mjs";

export default function loadModules(srcpath) {
  return new Promise((resolve, reject) => {

    const isRelative = /^[\\.\\/]/.test(srcpath);

    const dir = isRelative
      ? path.join(path.resolve(process.cwd()), srcpath)
      : path.resolve(srcpath);
   
    const myfs = new MyFS();
    const items = myfs
      .options({ modules: true, includeAll: true })
      .path(dir)
      .files(/\.mjs/)
      .execute();

    Promise.all(
      items
        .map((item) => {
          const importPath = "commands/" + item.name;
          return import(importPath).catch(err => { 
            const error = new Error(((err.code||'') + ' ' + err.message).trim());
            error.code = 'ERROR IN COMMAND MODULE: ' + importPath;
            error.stack = err.stack;
            throw error;
          });
        })
        .toArray()
    ).then((modules) => {
        const commands = modules.map((m, i) => {

          const fsitem = items.toArray()[i];
          const name = fsitem.name.replace(/\.mjs$/, "");

          return {
            command: name,
            options: m.options,
            handler: (argv) => {
              return new Promise((resolve, reject) => {
                m.execute(argv._.slice(1), argv, resolve, fsitem)
                  .catch((ex) => console.log(chalk.redBright(ex.message)));
              });
            },
          };
        }
      );
      resolve(commands);
    })

    .catch(error => {
      inspectErrorStack(error);
    });
  });
}
