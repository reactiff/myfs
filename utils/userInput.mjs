import require from './require.mjs';

const prompt = require('prompt');


function userInput(...promptText) {
  return new Promise((resolve, reject) => {
    prompt.start();
    prompt.get(
      [
        {
          name: 'input',
          description: [...promptText].join(' '),
          type: "any",
          required: true,
        },
      ],
      function (err, result) {
        if (!!result.input) {
          resolve(result.input);
          return;
        }
        resolve();
      }
    );
  });
}

export default userInput;