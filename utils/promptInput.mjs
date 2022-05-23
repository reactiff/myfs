import prompt from "prompt";

export function promptInput(promptText) {
  return new Promise((resolve, reject) => {
    prompt.start();
    prompt.get(
      [{ name: "input", description: promptText }],
      function (err, result) {
        resolve(result.input);
      }
    );
  });
}
