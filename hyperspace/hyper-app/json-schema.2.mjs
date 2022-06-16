// JSON Schema Validation with AJV
import Ajv from "ajv";
import inspectErrorStack from "utils/inspectErrorStack.mjs";
const ajv = new Ajv({ allErrors: true }); // options can be passed, e.g. {allErrors: true}

////////////////////////////////////////////
// JSON SCHEMA WORK IN PROGRESS
// TODO finish it
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
  function: { type: "string" },
  html: { type: "html" },
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
  } 
};

const dictionary = (keyPattern, value) => ({ type: "object", patternProperties: { [keyPattern]: value } });
const routeDictionary = (value) => dictionary("^/[a-z0-9-/]+$", value);

const array = (item, nullable) => ({ 
  type: "array", 
  nullable,
  "items" : item
})
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
  ...t.object,
  properties: {
    config: t.nullableObject,
    state: t.nullableObject,
    scripts: t.nullableArray,
    styles: t.nullableArray,                                        
    templates: dictionary("^/[a-z0-9-]+$", t.html),               // e.g.: "item": "<div class='item'></div>"
    actions: dictionary("^/[a-z0-9-]+$", t.function),                 // e.g.: "do-something": fn()
    hooks: dictionary("^[a-z0-9]*[a-z0-9\\.]*[a-z0-9]+$", t.function), // e.g.: "settings.profile.views": fn()
  },
  additionalProperties: false
};

const HyperEndpointSchema = {
  ...t.object,
  properties: {
    method: {
      nullable,
      enum: ["get", "post", "put", "patch", "delete"],
    },
    handler: t.function,
  },
  additionalProperties: false
};

const HyperActionSchema = {
  ...t.object,
  properties: {
    name: t.string,
    payload: t.object,
  },
  additionalProperties: false
};

const HyperAppConfig = {
  ...t.object,
  nullable,
  properties: {
    port: { ...t.integer, default: 8484 },
    host: t.nullableString,
    hotUpdate: { ...t.boolean, default: true }, // enable hot updates for static content
    hotPollInt: { ...t.integer, default: 1000 },
  },
  additionalProperties: false
};

const HyperAppSchema = {
  ...t.object,
  properties: {
    title: t.nullableString,
    state: t.nullableObject,
    pages: dictionary("^/[a-z0-9-]+$", HyperPageSchema),
    endpoints: dictionary("^/[a-z0-9-]+$", HyperEndpointSchema),
    config: HyperAppConfig,
  },
  additionalProperties: false,
};

////////////////////////////////////////////
// VALIDATE SCHEMA
const compiledSchemaChecker = ajv.compile(HyperAppSchema);

export const validateSchema = (schema) => {
  
  if (!schema.src) throw new Error('Schema is missing src folder.');

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

};
