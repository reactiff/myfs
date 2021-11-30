import userInput from "./userInput.mjs";

import { createRequire } from "module";
const require = createRequire(import.meta.url);



const chalk = require("chalk");
const boxen = require("boxen");
const prompt = require('prompt');

function getUserSelection(prompts) {
  return new Promise((resolve, reject) => {
    prompt.start();
    prompt.get(prompts,
      function (err, result) {
        resolve(result);
      }
    );
  });
}

function menu(dict) {
  return new Promise(async (resolve, reject) => {

    let selection;

    while (Object.keys(dict).length > 0 && !selection) {
      let entries = Object.entries(dict);

      // BANNER
      let n = 1;
      for (let e of entries) {

        console.log(`${n++}.`, chalk.yellow(e[0]))
      }

      console.log('');

      const promptFields = [{
        name: 'input',
        description: 'Enter action number or ENTER to exit',    
      }];

      selection = (await getUserSelection(promptFields))['input'];

      if (!selection) {
        resolve(null)
        return
      }

      let matched = {};
      
      // if by number
      if (Number.isInteger(+selection)) {
        
        const index = +selection - 1;

        if (index < Object.keys(dict).length && index >= 0) {
          const key = Object.keys(dict)[index];
          const T = Object.values(dict)[index];
          matched = {
            [key]: T,
          };
        }

      } else {
        // by string
        for (let key of Object.keys(dict)) {
          const re = new RegExp(`\[${selection}\]`, 'gi');
          if (re.test(key)) {
            matched[key] = dict[key];
            break;
          }
          if (key.startsWith(selection)) {
            matched[key] = dict[key];
            break;
          }
        }
      }
      dict = { ...matched };
    }

    const keys = Object.keys(dict);
    const key = keys[0];

    if (dict[key]) {
      dict[key]();
    }

    resolve(key);
  });
}

function input(...prompts) {
  userInput(...prompts);
}

export default {
  menu,
  input,
};
