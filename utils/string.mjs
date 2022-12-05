/* eslint-disable no-extend-native */

import { isNullOrUndefined } from "./validation.mjs";

export const camelToSentenceCase = (string) => {
  if (isNullOrUndefined(string) || string.trim().length === 0) return string;
  const tokens = string
    .replace(/([A-Z]+|[0-9]+)/g, " $1")
    .trim()
    .split(" ");
  return tokens
    .filter((t) => t && t.length)
    .map((token) => {
      const trimmed = token.trim();
      return trimmed[0].toUpperCase() + trimmed.substring(1);
    })
    .join(" ");
};

export const camelToKebabCase = (string) => {
  if (!string) return string;
  const tokens = string
    .replace(/([A-Z]+)/g, " $1")
    .trim()
    .split(" ");
  return tokens.map((token) => token.trim().toLowerCase()).join("-");
};

export const toProperCase = (string) => {
  if (!string) return string;
  return string[0].toUpperCase() + string.substring(1);
};

export const mutateWhile = (original, condition, transform) => {
  let result = original;
  while (condition(result)) {
    result = transform(result);
  }
  return result;
};

export const toCamelCase = (string) => {
  if (!string) return string;
  const temp = string.replace(/\s/g, "").trim();
  if (temp.length === 0) return "";
  return temp[0].toLowerCase() + temp.substring(1);
};

export const removeDoubleSpaces = (string) =>
  mutateWhile(
    string,
    (s) => s.indexOf("  ") >= 0,
    (s) => s.replaceAll(/\s\s/g, " ")
  ).trim();
