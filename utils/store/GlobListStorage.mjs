import { ListStorage } from "./ListStorage";

/** Do not pass strings to Storage constructors!  Use storageKeys dictionary. */


export class GlobListStorage extends ListStorage {
  constructor(uniqueKey) {
    super(uniqueKey, "glob", true);
  }
}
