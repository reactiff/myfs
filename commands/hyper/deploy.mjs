import inspectErrorStack from "utils/inspectErrorStack.mjs";
import webbify from "hyperspace/webbify.mjs";
import path from "path";
import myfs from "utils/myfs.mjs";
import fs from "fs";
import minimatch from "minimatch";
import chalk from "chalk";
import store from "utils/store.mjs";
import { parseOptions } from "utils/parseOptions.mjs";
import { assert } from "utils/assert.mjs";
import { config } from "../deploy/config.mjs";
import { execSync } from "child_process";
import { promptInput } from "utils/promptInput.mjs";

// COMMAND MODULE PROPS
export const help = `Manual help description`;
export const group = 'Web Apps';

class NodeSSHMock {}

var NodeSSH = NodeSSHMock; // will be lazy loaded if it is nedded

const cwd = path.resolve(process.cwd());
const manifestoFile = config.manifestoFile;

export const options = {
  B: {
    alias: "build",
    description: "Upload the manifesto to cause a rebuild",
    type: "boolean",
  },
  H: {
    alias: "host",
    description: "Remote host",
    type: "string",
  },
  PWD: {
    alias: "pwd",
    description: "SSH root password",
    type: "string",
  },
  P: {
    alias: "port",
    description: "Port number",
    type: "number",
  },
  U: {
    alias: "update",
    description: "Upload files and exit",
    type: "number",
  },
  PMC: {
    alias: "pm-create",
    description: "PM2 create and start the process",
    type: "boolean",
  },
  PMR: {
    alias: "pm-restart",
    description: "PM2 restart process",
    type: "boolean",
  },
  PMW: {
    alias: "pm-watch",
    description: "PM2 start with --watch flag",
    type: "boolean",
  },
};

function parsePatterns(str) {
  return str
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => !l.startsWith("#"))
    .filter((l) => l.length > 0);
}

function loadIgnorePatterns() {
  let dirItems = fs.readdirSync(cwd);
  let patterns = parsePatterns(ignore_patterns);
  for (let basename of dirItems) {
    const stat = fs.lstatSync(path.join(cwd, basename));
    if (
      stat.isFile() &&
      basename.startsWith(".") &&
      basename.includes("ignore")
    ) {
      patterns = patterns.concat(
        parsePatterns(fs.readFileSync(path.join(cwd, basename), "utf8"))
      );
    }
  }
  return Array.from(new Set(patterns));
}

function getHost(argv) {
  if (argv.host) {
    const info = store.get(argv.host) || {};
    if (!info.pwd && !argv.pwd)
      throw new Error("SSH root password missing for host");
    if (argv.pwd) info.pwd = argv.pwd;
    return { host: argv.host, ...info };
  }
  const hosts = store.get("hosts");
  if (Array.isArray(hosts)) {
    for (let h of hosts) {
      const info = store.get(h);
      if (info && info.default === "true") {
        return { host: h, ...info };
      }
    }
  }
}

function getStartScript(pkg, argv) {
  if (pkg.scripts && pkg.scripts.start) return pkg.scripts.start;
  if (pkg.main) return "node " + pkg.main;
  if (argv.main) return "node " + argv.main;
  throw new Error(
    'Entry point?\n\nPackage.json does not contain an entry point { main: "index.js" } or { scripts: { start: "node index.js" } }'
  );
}

function printResult(result) {
  if (result.stdout) {
    console.log(">", result.stdout);
  }
  if (result.stderr) {
    console.log(">", result.stderr);
  }
  if (!result.stdout) {
    console.log(">", result);
  }
}

function exec(args, then) {
  return {
    name: "execCommand",
    args,
    then,
  };
}

function putFile(file, then) {
  return {
    name: "putFile",
    args: [file.localPath, file.remotePath],
    then,
  };
}

function tick(local, remote, error) {
  if (error) {
    throw new Error(error + "\n\nFailed to upload:", local);
  }
}

function putDirectory(file, then) {
  return {
    name: "putDirectory",
    args: [
      file.localPath,
      file.remotePath,
      { recursive: true, concurrency: 1, validate: file.validate, tick },
    ],
    then,
  };
}

function cmdLog(message) {
  return {
    name: "log",
    args: [chalk.yellow(message)],
  };
}

function buildPathTo(fullPath) {
  const tokens = fullPath.replace(/\\/g, "/").split("/");
  const cmds = [];
  for (let i = 1; i <= tokens.length; i++) {
    if (i > 2) {
      cmds.push(
        exec(["mkdir " + tokens.slice(0, i).join("/"), {}], printResult)
      );
    }
  }
  return cmds;
}

function getSSHCommandList(d) {

  // create directories
  const commands = [
    cmdLog("connect"),
    {
      name: "connect",
      args: [{ host: d.host.host, username: "root", password: d.host.pwd }],
    },
    // cmdLog("creating remote deployment directory: " + d.remoteDeploymentRoot),
    // ...buildPathTo(d.remoteDeploymentRoot),
    // exec([ "cd " + d.remoteDeploymentRoot, {} ], printResult),
    cmdLog("upload"),
  ];

  // upload files and directories
  for (let file of d.files) {
    if (file.isFile) {
      commands.push(putFile(file));
    } else {
      commands.push(putDirectory(file));
    }
  }

  if (d.build) {
    // UPLOAD MANIFESTO (FINAL STEP)
    commands.push(
      putFile({
        basename: manifestoFile,
        localPath: path.join(cwd, manifestoFile),
        remotePath: path
          .join(config.paths.manifestos, d.manifesto.manifestoFile || d.appName + '.subdomain.json')
          .replace(/\\/g, "/"),
        isFile: true,
        validate: (itemPath) => {
          console.log(itemPath);
          return true;
        },
      })
    );
  }  

  commands.push(cmdLog("DONE!"));

  return commands;
}

export async function execute(args, argv, resolve) {

  import('node-ssh')
  .then(m => {
    debugger
    NodeSSH = m.NodeSSH;
    safeExecute(args, argv, resolve);
  })
  .catch(ex => {
    console.log(chalk.bgRed.white('NodeSSH is not available in this environment or build'));
  });
}


/**
 * safeExecute is called by execute IF node-ssh module resolves.
 * @param {*} args 
 * @param {*} argv 
 * @param {*} resolve 
 */
export async function safeExecute(args, argv, resolve) {
  try {
    
    parseOptions(argv, options);

    const manifesto = JSON.parse(
      fs.readFileSync(path.join(cwd, manifestoFile), "utf8")
    );
    const pkg = JSON.parse(
      fs.readFileSync(path.join(cwd, "package.json"), "utf8")
    );

    const deployment = {
      build: argv.build,
      appName: manifesto.name || pkg.name,
      manifesto,
      package: pkg,
      host: getHost(argv),
      startScript: getStartScript(pkg, argv),
      files: [],
      argv,
    };

    const ignorePatterns = loadIgnorePatterns();

    const pathIsNotIgnored = (testPath) => {
      console.log(testPath);
      return !ignorePatterns.some((ignore) =>
        minimatch(testPath, ignore, { dot: true })
      );
    };

    deployment.deploymentPath = path
      .join(config.paths.apps, deployment.appName)
      .replace(/\\/g, "/");

    // for server components like deployment-watcher
    if (manifesto.deploymentPath) {
      deployment.deploymentPath = path
        .join(manifesto.deploymentPath, deployment.appName)
        .replace(/\\/g, "/");
    }

    let dirItems = fs.readdirSync(cwd);
    for (let file of dirItems) {
      if (pathIsNotIgnored(file)) {
        const fullPath = path.join(cwd, file);
        const stat = fs.lstatSync(fullPath);
        const remotePath = path
          .join(deployment.deploymentPath, file)
          .replace(/\\/g, "/");
        deployment.files.push({
          basename: file,
          localPath: fullPath,
          remotePath,
          isFile: stat.isFile(),
          isDir: stat.isDirectory(),
          validate: pathIsNotIgnored,
        });
      }
    }

    console.group("\n");
    console.log(deployment.appName, "v" + pkg.version);
    console.log("------------------------------");
    console.log("HERE IS THE DEPLOYMENT SCRIPT:");
    console.log("------------------------------");
    const commands = getSSHCommandList(deployment);
    commands.forEach((cmd) => {
      if (cmd.name === "log") {
        console.log(...cmd.args);
      } else {
        console.log("ssh", cmd.name, ...cmd.args);
      }
    });
    console.log("\n");
    console.groupEnd();

    promptInput("Proceed with deployment? [y/n]").then((input) => {
      if (input === "y") {
        run(commands).then(() => {
          process.exit(1);
        });
      } else {
        process.exit(0);
      }
    });
  } catch (ex) {
    inspectErrorStack(ex);
  }
}

function run(commands) {
  return new Promise((resolve, reject) => {
    async function asyncRun() {
      try {
        debugger
        const newVersion = execSync("npm version patch"); // bump revision number
        debugger
        const ssh = new NodeSSH();
        for (let cmd of commands) {
          if (cmd.name === "log") {
            console.log(...cmd.args);
          } else {
            const command = ssh[cmd.name];
            const args = cmd.args;
            console.log(cmd.name, ...cmd.args);
            const r = await command.call(ssh, ...args);
            if (cmd.then) {
              cmd.then(r);
            }
          }
        }
        resolve();
      } catch (err) {
        reject(err.message || err);
      }
    }
    asyncRun();
  });
}

const ignore_patterns = `
${manifestoFile}
cli-deploy.manifesto.json

node_modules
npm-debug.log

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage

# nyc test coverage
.nyc_output

# Grunt intermediate storage (http://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# Typescript v1 declaration files
typings/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# next.js build output
.next

.git
.gitignore
.vscode
.dockerignore
Dockerfile

.eslintrc.json

__*.*
*.xlsx
*.bat

`;
