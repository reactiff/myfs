import inspectErrorStack from "./inspectErrorStack.mjs";

const defaultKeyTransform = (value, key) => key;
const defaultValueTransform = (value, key) => value;

/**
 * Returns a new object with remapped keys and values.
 * @param object
 * @param options
 */
function remap(
  object,
  keyValueCallbacks = { key: defaultKeyTransform, value: defaultValueTransform }
) {
  try {
    const options = {
      key: keyValueCallbacks.key || defaultKeyTransform,
      value: keyValueCallbacks.value || defaultValueTransform,
    };

    const result = {};
    for (let key of Object.keys(object)) {
      const newKey = options.key ? options.key(object[key], key) : key;
      const newValue = options.value
        ? options.value(object[key], key)
        : object[key];
      Object.assign(result, { [newKey]: newValue });
    }
    return result;
  } catch (err) {
    inspectErrorStack(err);
  }
}

export default remap;
