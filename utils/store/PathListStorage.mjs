import path from "path";
import chalk from "chalk";
import fs from "fs";
import { ListStorage } from "./ListStorage";

/** Do not pass strings to Storage constructors!  Use storageKeys dictionary. */


export class PathListStorage extends ListStorage {
  constructor(uniqueKey) {
    super(uniqueKey, "path", true);
  }

  add(value) {
    // done
    const pathToAdd = path.resolve(value);

    if (!fs.existsSync(pathToAdd)) {
      console.error(chalk.red("Invalid path: "), pathToAdd);
      return;
    }

    super.add(pathToAdd, true);
  }

  delete(value) {
    super.delete(value);
  }

  clear() {
    super.clear();
  }
}
