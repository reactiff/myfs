import Evernote from "evernote";
import _ from "lodash";
import cliProgress from "cli-progress";

function createProgress(data, options) {
  debugger;

  // create new container
  const multibar = new cliProgress.MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
      ...options,
    },
    cliProgress.Presets.shades_grey
  );

  let bars;
  if (Array.isArray(data)) {
    bars = data.map((item) => multibar.create(item.total, item.startValue));
  } else {
    const keys = Object.keys(data);
    const isDict = keys.every((key) => {
      return Object.keys(data[key]).length > 0;
    });
    if (isDict) {
      bars = keys.reduce(
        (a, key) =>
          Object.assign(a, {
            [key]: multibar.create(data[key].total, data[key].startValue),
          }),
        {}
      );
    } else {
      bars = multibar.create(data.total, data.startValue);
    }
  }

  return {
    abort: () => {
      multibar.stop();
      process.exit();
    },
    stop: () => {
      multibar.stop();
      process.exit();
    },
    bars,
  };
}

export async function execute(context) {
  try {

    const { args, argv } = context;
    

    debugger;

    var developerToken =
      "S=s1:U=9684c:E=1841e5b4200:C=17cc6aa1600:P=1cd:A=en-devtoken:V=2:H=e52d72f0500bf755370d7add8f69803d";
    var client = new Evernote.Client({
      token: developerToken,
      serviceHost: "https://www.evernote.com/api/DeveloperToken.action",
    });

    // Set up the NoteStore client
    var noteStore = client.getNoteStore();

    const progress = createProgress({
      Search: {},
      Fetch: {},
    });

    // Make API calls
    noteStore
      .listNotebooks()
      .then((notebooks) => {
        debugger;

        progress.update(1);

        for (var i in notebooks) {
          console.log("Notebook: " + notebooks[i].name);
        }

        progress.stop();
      })
      .catch((ex) => {
        progress.abort();
        debugger;
      });

  } catch (ex) {
    throw new Error(ex.message);
  }
}
