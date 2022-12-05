// JSON Schema Validation with AJV
import Ajv from "ajv";
import inspectErrorStack from "utils/inspectErrorStack.mjs";
const ajv = new Ajv({ allErrors: true }); // options can be passed, e.g. {allErrors: true}

////////////////////////////////////////////
// JSON SCHEMA WORK IN PROGRESS
// https://ajv.js.org/json-schema.html#json-data-type

const JsonSchemaTypes = {
  string: { type: "string" },
  integer: { type: "integer" },
  number: { type: "number" },
  boolean: { type: "boolean" },
  array: { type: "array" },
  object: { type: "object" },
  types: (...arrTypes) => ({ type: arrTypes }),
};
const t = JsonSchemaTypes;
const JsonSchemaPropertyAttributes = {
  nullable: { nullable: true },
  required: { required: true },
};
const pa = JsonSchemaPropertyAttributes;
// const JsonSchemaNumberAttributes = {};
// const na = JsonSchemaNumberAttributes;
// const JsonSchemaArrayAttributes = {
//   minItems: n => ({ minItems: n }),
//   maxItems: n => ({ maxItems: n }),
//   uniqueItems: { uniqueItems: true },
// };
// const ar = JsonSchemaArrayAttributes;

const HyperRouteSchema = {
  ...t.object,
  properties: {
    // route properties!
    method: {
      ...ajv.nullable,
      enum: ["get", "post", "put", "patch", "delete"],
    },
    view: { ...t.string },
    data: { ...t.object },
  },
};

const HyperAppSchema = {
  ...t.object,
  properties: {
    name: { ...t.string, ...pa.nullable },
    title: { ...t.string, ...pa.nullable },
    view: { ...t.string, ...pa.nullable }, // filename
    style: { ...t.string, ...pa.nullable }, // filename
    src: { ...t.string, ...pa.nullable }, // path to sources files (html, css)
    // global: {
    //   ...t.object,
    //   properties: {
    //     data:  { ...t.types('object', 'array') },
    //     style: { ...t.object },
    //   },
    // },
    routes: Object.assign({}, pa.nullable, t.object, {
      patternProperties: {
        "^/[a-z0-9-]+$": HyperRouteSchema,
      },
    }),
    engine: { ...t.string, ...pa.nullable, enum: ["hyper", "pug"] },
    port: { ...t.integer, default: 8484 },
    public: { ...t.boolean, default: false },
    publicFolder: { ...t.string, ...pa.nullable },
    host: { ...t.string, ...pa.nullable },
    deploy: { ...t.boolean, default: false },
    hotUpdate: { ...t.boolean, default: false }, // enable hot updates for static content
    hotPollInt: { ...t.integer, default: 1000 },
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
