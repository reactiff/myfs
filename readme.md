# THIS FILE IS NO LONGER MAINTAINER

IT MOVED TO EVERNOTE!

https://www.evernote.com/shard/s638/sh/4f630564-ae1b-0612-7ac5-ee9a96c44274/22fc57a78a40aeb0472be67f8c6bd6e6


---

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

If installation is screwed up, follow these steps to uninstall manually: 

1. go to: c:\users\rellis\AppData\Roaming\npm 
2. locate and delete files by name
3. go into node_modules there and do the same
```bash

```

<br>

# Commands

## Included globs.  View / Add / Remove
```bash
myfs include 
myfs include [--add <pattern>]
myfs include [--remove <pattern>]
```

## Excluded globs.  View / Add / Remove
```bash
myfs exclude 
myfs exclude [--add <pattern>]
myfs exclude [--remove <pattern>]
```

## Global paths.  View / Add / Remove.
```bash
myfs paths                     
myfs paths [--add <path>]      
myfs paths [--remove <path>]   
```

## Toggle verbose mode
```bash
myfs verbose
```

<br>

## Search files
```bash
myfs ls [options]
    -[O|-order] name|size|atime|mtime|ctime|btime
    -[D|-dirs] 
    -[F|-files] 
    -[G|-global]
    -[R|-recursive]
    -[P|-pattern] <glob>
    -[S|-search] </regex/>
    -[W|-webbify] 
```

## List storage
```bash
myfs list <name>
myfs list <name> [--add <value>]
myfs list <name> [--remove <value>]
myfs list <name> [--clear]
myfs list <name> [--hist]
myfs list <name> [--revert]
```

## Key/Value storage

```js
// set value for key
myfs set key value
```

```js
// set prop of an object at key
myfs set apply key prop value 
```

```js
fs get
fs get <key>
```

## Serve app locally
```bash
fs serve
```

## Deploy app to remote server (VPS)
```bash
fs deploy 
    -[M|-main] <./index.js>
    -[P|-port] 3001
    -[U|-update]
    [--pm-watch]
    [--pm-create]
    [--pm-restart]
```

## Project setup notes

## Package.json
When the CLI gets installed, it is registered under an alias, **fs** in this case, which is specified in package.json under "bin": 
```json
{
  "bin": {
    "fs": "./bin/index.js"   <-- here
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
