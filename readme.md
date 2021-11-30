# myfs
My file system.  A better way to work with files from command line.

## DEV mode

Install
```
npm i -g
```

Uninstall (run exactly as shown):
```bash
npm uninstall -g app-cli
```
NOTE: Be sure to uninstall it first before renaming it or moving to another folder.

## Commands

```js

myfs include 
myfs include [--add <pattern>]
myfs include [--remove <pattern>]

myfs exclude 
myfs exclude [--add <pattern>]
myfs exclude [--remove <pattern>]

myfs paths 
myfs paths [--add <path>]
myfs paths [--remove <path>]

myfs verbose

myfs ls [options]
    -[O|-order] name|size|atime|mtime|ctime|btime
    -[D|-dirs] 
    -[F|-files] 
    -[G|-global]
    -[R|-recursive]
    -[P|-pattern] <glob>
    -[S|-search] </regex/>
    -[W|-webbify] 

myfs list <name> [--add <value>]
myfs list <name> [--remove <value>]
myfs list <name> [--clear]
myfs list <name> [--hist]
myfs list <name> [--revert]

myfs set <key> <value>
myfs set apply <key> <prop> <value>

myfs get
myfs get <key>

myfs serve

myfs deploy 
    -[M|-main] <./index.js>
    -[P|-port] 3001
    -[U|-update]
    [--pm-watch]
    [--pm-create]
    [--pm-restart]


```

## Project setup notes

## Package.json
When the CLI gets installed, it is registered under an alias, **meta** in this case, which is specified in package.json under "bin": 
```json
{
  "bin": {
    "myfs": "./bin/index.js"   <-- here
  }
}
```
https://developer.okta.com/blog/2019/06/18/command-line-app-with-nodejs


<style>
html, body {
    margin: 0;
    padding: 3vw;
}

p, code, td, th, li { font-size: smaller; line-height: 1.4;  }

h2 {
    margin-top: 5vw;
}
table {
    
    width: 100%;
}
th:first-of-type,
td:first-of-type  { 
    width: 1%;
    min-width: unset;
}
th, td { 
    width: 99%;
}
th {
    
    font-weight: bold;
}
td {
    vertical-align: top;
}
</style>