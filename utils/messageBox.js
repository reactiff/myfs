import { createRequire } from "module";
const require = createRequire(import.meta.url);

// const chalk = require("chalk");
// const prompt = require('prompt');

const boxen = require("boxen");

const messageBox = (text, options = {}) => {
  console.log(
    boxen(text, {
      padding: options.padding || 1,
      borderColor: options.borderColor || '#808080',
      backgroundColor: options.bgColor || "#111",
      margin: options.margin || 0,
    })
  );
};

export default messageBox;
