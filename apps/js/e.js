
const e = function(...a) {
  const tag = a[0];
  const props = a.length > 2 ? a[1] : {};
  const content = a.length > 1 ? a[a.length - 1] : undefined;

  const stack = createStack(tag);

  
  const root = parseElements(stack, content);

  return root;
};

const gen = e;
const $e = e;

// rewrite this with matchAll when its working
function createStack(input) {
  const re = /^(\S+(\s*\>\s*\S+)+)/;
  const stackedm = re.exec(input);
  const stack = [];
  if (stackedm != null) {
    const tokens = stackedm[1].split(">");
    tokens.forEach((x) => {
      stack.push(parseTag(x.trim()));
    });

    // input > tag > chain resulted in a stack
    // content will be added to the Top most element 
    // and each stack element will be added to its parent
  
    return stack;
  } 

  // there is only one element in the stack
  stack.push(parseTag(input));
  return stack;
}

function parseTag(input) {
    
  
  const name = parseName(input);
  const id = parseId(input);
  const events = parseEvents(input);
  const classes = parseClasses(input);
  const switches = parseSwitches(input);
  const attributes = parseAttributes(input);
  
  return { name, id, events, classes, switches, attributes };
}

// this is treating arguments as if they are spread...
// all children are passed in one array
// we probably don't need this!
// TEST IT BY PASSING A SPREAD OF ITEMS.  In fact it should throw an error.
// if (arguments.length > 2) {
//     debugger
//     content = [].slice.apply(arguments).slice(1);
// }

function parseElements(stack, content) {

  let e;
  while (stack.length) {
    var top = stack.pop();
    e = document.createElement(top.name);
    if (top.id) {
      e.setAttribute("id", top.id);
    }
    if (top.className) {
      e.setAttribute("class", top.className.split(".").join(" "));
    }
    top.attributes.forEach((attr) => e.setAttribute(attr.key, attr.value));
    injectContent(e, content);
  }
  return e;
}

function injectContent(target, content) {
  // if (!content) return;
  if (Array.isArray(content)) {
    content.forEach((item) => injectContent(target, item));
  } else {
    target.appendChild(createNode(target, content));
  }
}

function createNode(target, content) {
  if (isNode(content)) return content;
  if (isList(target)) return createList(target, content);
  
  if (content instanceof HTMLElement) {
    debugger
    return content;
  }

  return document.createTextNode(content);
}

// let findReplace = (s, f, r) => { s = s.replace(f, r); s = s.repalce(r + r, r);}
function getListItemTagName(target) {
  return target.tagName.toLowerCase() === "select" ? "option" : "li";
}
function createList(target, content) {
  return $e(getListItemTagName(target), content);
}
function isList(t) {
  return ["ul", "ol", "select"].includes(t.tagName.toLowerCase());
}
function isNode(n) {
  typeof n === "object" && Reflect.has(n, "nodeName");
}
function reParse(re, str) {
  let m = re.exec(str);
  return m && m.length > 0 ? m[1] : undefined;
}
function mutateWhile(s, test, mutate) {
  while (test(s)) {
    mutate(s);
  }
}
function getOffsets(m, prefix, postfix) {
  const pre = prefix !== undefined ? prefix : ".";
  const post = postfix !== undefined ? postfix : ".";
  return [m.startsWith(pre) ? pre.length : 0, m.endsWith(post) ? post.length : 0];
}

function extractPattern(s, regex, prefix, postfix) {

  let sm = s + '\n';
  // const m1 = Array.from(sm.matchAll(regex));
  const m = Array.from(sm.match(regex));
  // const m = Array.from((s + '\n').matchAll(regex));

  if (!m || m.length === 0 || m[0] === null) return null;
  const p = Array.isArray(m[0]) ? m[0][0] : m[0];
  const l = p.length;
  const [o1, o2] = getOffsets(p, prefix, postfix);
  sm = sm.toString().trim();
  const i = sm.findIndex(p.trim());
  sm = sm.splice(i + o1, l - o1 - o1);
  s = sm;
  return p.slice(0 + o1, l - o2);

}

// Syntax parsers
function bestMatch(s, regex, prefix, postfix) {
  const m = Array.from((s + '\n').matchAll(regex));
  if (!m || m.length === 0 || m[0] === null) return null;
  const p = Array.isArray(m[0]) ? m[0][0] : m[0];
  const l = p.length;
  const [o1, o2] = getOffsets(p, prefix, postfix);
  return p.slice(0 + o1, l - o2).trim();
}

function parseName(input) {
  return reParse(/^([a-zA-Z0-9]+?)($|\#|\s|\n|\.)/, input)
    // return bestMatch(input, /([a-zA-Z]+?)[\b\.#\n]/g, '', '#');
}

function parseId(input) {
  return bestMatch(input, /\#(\S+?)[\b\.\n\s$]/g, '#', '.');
}

// .event(abc).
function parseEvents(s) {
  const events = [];
  const re = /[\.\b]([[:alnum:]]+?\(.*?\))[\.\b\n]/g;
  const extractEvent = (str) => {
    const p = extractPattern(str, re);
    events.push(p), events.push(p);
  };
  mutateWhile(
    s,
    (str) => re.test(str + "\n"),
    (str) => extractEvent(str)
  );
  return events;
}

// .class.
function parseClasses(s) {
  const classes = reParse(/[\S\s\-]+?\.([\S\-]+?)(\s|\#|$)/, s);
  return classes;
  //const classes = [];
  const re = /[\.\b]([a-zA-Z]+?)[\.\b\n]/g;
  const extractClass = (str) => {
    const p = extractPattern(str, re);
    classes.push(p);
  };
  mutateWhile(
    s,
    (str) => re.test(str + "\n"),
    (str) => extractClass(str)
  );
  return classes;
}

// .switch!.
function parseSwitches(s) {
  const switches = [];
  const re = /[\.\b]([[:alnum:]]+?!)[\b\.\n]/g;
  const extractSwitch = (str) => {
    const p = extractPattern(str, re);
    switches.push(p);
  };
  mutateWhile(
    s,
    (str) => re.test(str + "\n"),
    (str) => extractSwitch(str)
  );
  return switches;
}

function parseAttributes(s) {
  const attrs = [];
  const re = /[\.\b]([[:alnum:]]+?=(".*?"|{.*?}))[\.\b\n]/g;
  const extractAttr = (str) => {
    const p = extractPattern(str, re);
    attrs.push(p);
  };
  mutateWhile(
    s,
    (str) => re.test(str + "\n"),
    (str) => extractAttr(str)
  );
  return attrs;
}
