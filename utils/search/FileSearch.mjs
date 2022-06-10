import chalk from "chalk";
import inspectErrorStack from "../inspectErrorStack.mjs";
import fs from "fs";
import path from "path";
import ContentSearchResult from "./ContentSearchResult.mjs";
import { parseRegexInput } from "../parseRegexInput.mjs";

export default class FileSearch {
  file;

  startTime;
  endTime;
  elapsed;

  ok;

  fileContent;
  lineResults = [];
  multilineResults = [];

  error;
  errorCount = 0;

  constructor(fsi) {
    this.file = fsi;
  }

  start() {
    if (this.startTime !== undefined)
      throw new Error("This should never happen");
    this.file.myfs.search.startedCount++;
    this.startTime = Date.now();
    this._execute()
      .then(() => {
        this._terminate(true);
        this._onSearchComplete();
      })
      .catch((error) => {
        if (this.errorCount) return;
        this.errorCount++;
        inspectErrorStack(error);
        console.log(chalk.bgHex("#550000")(error.stack));
        this._terminate(false, error);
        this._onSearchComplete();
      });
  }

  ///////////////////////////////// PRIVATE PARTS

  /** Private method. Do not use.*/
  _terminate(ok, error) {
    if (error) {
      this.ok = false;
      this.error = error.message || error;
    } else {
      this.ok = ok;
    }
    this.endTime = Date.now();
    this.elapsed = this.endTime - this.startTime;
  }

  /** Private method. Do not use.*/
  _execute() {
    const search = this;
    const fsi = this.file;
    return new Promise((resolve, reject) => {
      try {
        if (search.errorCount) return;
        search.fileContent = fs.readFileSync(path.resolve(fsi.fullPath), "utf8");

        const regex = parseRegexInput(fsi.myfs.options.find);
        
        // first try to find matches within each line
        const lines = search.fileContent.split('\n');
        lines.forEach((line, index) => {
            const matches = [];
            let match;
            while ((match = regex.exec(line)) !== null) {
                matches.push(match);
            }
            if (matches.length) {
                search.lineResults.push(new ContentSearchResult({ search, pattern: fsi.myfs.options.find, matches, line, lineNumber: index + 1, multiline: false }))    
            }
            
        })

        // now on whole file
        // const matches = [...search.fileContent.match(pattern)];
        // search.multilineResults.push(...matches.map(match => new ContentSearchResult({ search, pattern, match, multiline: true })))

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  /** Private method. Do not use.*/
  _onSearchComplete() {

    const { myfs } = this.file;
    
    myfs.search.finishedCount++;
    myfs.search.progress = myfs.search.finishedCount / myfs.search.startedCount;

    if (this.lineResults.length || this.multilineResults.length) {
      myfs.search.results.push(this);
    }

    if (myfs.search.startedCount === myfs.search.finishedCount) {
      myfs.notify("results-ready", {
        items: myfs.search.results,
        progress: myfs.search.progress,
      });
    }
  }
}
