// JSON Schema Validation with AJV
import Ajv from "ajv";
import chalk from "chalk";
import inspectErrorStack from "utils/inspectErrorStack.mjs";
import { printToConsole } from "utils/printToConsole.mjs";
import { camelToSentenceCase } from "utils/string.mjs";
const ajv = new Ajv({ allErrors: true }); // options can be passed, e.g. {allErrors: true}

////////////////////////////////////////////
// JSON SCHEMA WORK IN PROGRESS
// https://ajv.js.org/json-schema.html#json-data-type

const nullable = true;
const required = true;

let t = {
  string: { type: "string" },
  integer: { type: "integer" },
  number: { type: "number" },
  boolean: { type: "boolean", default: false },
  array: { type: "array" },
  object: { type: "object" },
  function: { type: "object" },
  html: { type: "string" },
  types: (...arrTypes) => ({ type: arrTypes }),
};

t = {
  ...t,
  ...{
    nullableObject: { ...t.object, nullable },
    nullableArray: { ...t.array, nullable },
    nullableString: { ...t.string, nullable },
    nullableInteger: { ...t.integer, nullable },
    nullableNumber: { ...t.number, nullable },
    nullableBoolean: { ...t.boolean, nullable },
    nullableFunction: { ...t.function, nullable },
  },
};

const dictionary = (keyPattern, value) => ({
  [Symbol.for("schema-type")]: "Dictionary",
  type: "object",
  patternProperties: { [keyPattern]: value },
});

const nullableDictionary = (keyPattern, value) => ({
  ...dictionary(keyPattern, value),
  nullable,
});

const routeDictionary = (value) => dictionary("^/[a-z0-9-/]+$", value);

const array = (item, nullable) => ({
  type: "array",
  nullable,
  items: item,
});
const nullableArray = (item) => array(item, true);

// const JsonSchemaNumberAttributes = {};
// const na = JsonSchemaNumberAttributes;
// const JsonSchemaArrayAttributes = {
//   minItems: n => ({ minItems: n }),
//   maxItems: n => ({ maxItems: n }),
//   uniqueItems: { uniqueItems: true },
// };
// const ar = JsonSchemaArrayAttributes;

const HyperPageSchema = {
  [Symbol.for("schema-type")]: '"HyperPageSchema"',
  ...t.object,
  properties: {
    
    /**
     * In render() you can do one of the following:
     * 
     *  1)  Return HTML 
     * 
     *      If you return HTML it will be merged into base HTML 
     *      and then if it contains any {tags} those will receive 
     *      merged values from state.
     * 
     *  2)  Send the response yourself and return nothing (null or undefined).
     *      The server will end request handling if it sees this method but it returns nothing.
     * 
     *      e.g. 
     *      
     *        render(req, ctx) {
     *          if (req.params.command = 'whoami') { // let's just say...
     *            const content = 'You must be a human';
     *            const html = ctx.html.replace('{content}', content);
     *            res.setHeader("Content-Length", Buffer.byteLength(html));
     *            res.status(200).send(html);
     *          }
     *        } 
     */
    
    render: {}, //t.nullableFunction, // e.g.: (req, { page, app, html, res }) => string | void
    
    html: t.nullableString,
    state: t.nullableObject,
    events: nullableDictionary("^on[A-Z][a-z0-9-]+$", t.function),
    scripts: t.nullableArray,
    styles: t.nullableArray,
    templates: nullableDictionary("^/[a-z0-9-]+$", t.html), // e.g.: "item": "<div class='item'></div>"
    actions: nullableDictionary("^/[a-z0-9-]+$", t.function), // e.g.: "do-something": fn()
    hooks: nullableDictionary("^[a-z0-9]*[a-z0-9\\.]*[a-z0-9]+$", t.function), // e.g.: "settings.profile.views": fn()
  },
  additionalProperties: false,
};

const HyperEndpointSchema = {
  [Symbol.for("schema-type")]: '"HyperEndpointSchema"',
  ...t.object,
  properties: {
    method: {
      nullable,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },

    /**
     * In handle() you can do one of the following:
     * 
     *  1)  Return something (preferably an object)
     * 
     *      If you return a value, it will be treated as data 
     *      and the response will look like this: { ok: true, data: value  }
     * 
     *  2)  Return nothing
     * 
     *      Send the response yourself and 
     *        a) either do not return anything
     *        b) return null or undefined
     * 
     *      The server will end request handling if it sees 
     *      null or undefined returned.
     * 
     *      e.g. 
     *      
     *        handle(req, ctx) {
     *          if (req.params.command = 'whoami') { // let's just say...
     *            const data = { message: 'You must be a human' };
     *            res.setHeader("Content-Length", Buffer.byteLength(html));
     *            res.status(200).send(html);
     *          }
     *        } 
     */
    handler: t.function,
  },
  additionalProperties: false,
};

const HyperAppSchema = {
  [Symbol.for("schema-type")]: '"HyperAppSchema"',
  ...t.object,
  properties: {
    name: t.nullableString,
    title: t.nullableString,
    state: t.nullableObject,
    events: nullableDictionary("^on[A-Z][a-z0-9-]+$", t.function),
    pages: nullableDictionary("^/[a-z0-9-]+$", HyperPageSchema),
    endpoints: nullableDictionary("^/[a-z0-9-]+$", HyperEndpointSchema),
    public: { ...t.boolean, default: false },
    port: { ...t.integer, default: 8484 },
    host: t.nullableString,
    hotUpdate: { ...t.boolean, default: true }, // enable hot updates for static content
    hotPollInt: { ...t.integer, default: 1000 },
  },
  additionalProperties: false,
};

export function applySchemaDefaults(schema) {
  // debugger

  const s = schema;
  const props = Object.entries(HyperAppSchema.properties || {});
  for (let kv of props) {
    if (schema[kv[0]] === undefined && Reflect.has(kv[1], "default")) {
      schema[kv[0]] = kv[1].default;
    }
  }
  if (!s.title) s.title = camelToSentenceCase(s.name || "untitled");
  return schema;
}

////////////////////////////////////////////
// VALIDATE SCHEMA
let compiledSchemaChecker;

try {
  compiledSchemaChecker = ajv.compile(HyperAppSchema);
} catch (ex) {
  printToConsole(chalk.bgHex("#AA0000").white(ex.message));
}

export function validateSchema(schema) {
  // TODO delete this
  // if (!schema.src) throw new Error("Schema is missing src folder.");

  // Validate options against the schema
  let valid;
  try {
    valid = compiledSchemaChecker(schema);
  } catch (err) {
    inspectErrorStack(err);
  }
  if (!valid) {
    const error = new Error("HyperApp Schema Validation");
    error.schema = schema;
    error.type = "schemaValidation";
    error.list = compiledSchemaChecker.errors;
    throw error;
  }

  return schema;
}
