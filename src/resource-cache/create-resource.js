import invariant from "tiny-invariant";
import { IS_RESOURCE, RESOURCE_FETCH, RESOURCE_HASH } from "./constants";

// IMPORTANT NOTE:
// The fetch function should resolve or reject to data that will be kept intact
// if serialized with the serialize-javascript library. For resolves that will
// typically always be the case since it will most likely have been parsed from
// JSON. However for rejections you should not rely on extending the Error
// constructor and expecting the user of the resource to use the instanceof
// operator to test for specific failures. Instead set particular properties on
// the error object that the user can test for the presence of.
export default function createResource(fetch, hashInput) {
  return {
    [IS_RESOURCE]: true,
    [RESOURCE_FETCH]: wrapFetch(fetch),
    [RESOURCE_HASH]: wrapHashInput(hashInput),
  };
}

function wrapFetch(fetch) {
  invariant(typeof fetch === "function", "expected fetch to be a function");

  return input => {
    const promise = fetch(input);
    invariant(
      promise instanceof Promise,
      "expected resource fetch function to return a promise",
    );

    return promise;
  };
}

function wrapHashInput(hashInput) {
  invariant(
    !hashInput || typeof hashInput === "function",
    "expected hashInput to be falsy or a function",
  );

  if (hashInput) {
    return input => {
      const hash = hashInput(input);

      if (__DEV__) {
        invariant(
          isPrimitive(hash),
          "expected resource hash function to return a primitive type",
        );
      }

      return hash;
    };
  } else {
    return input => {
      if (__DEV__) {
        invariant(
          isPrimitive(input),
          "expected input to be a primitive type\n" +
            "did you forget to specify a hash function for the resource?",
        );
      }

      return input;
    };
  }
}

function isPrimitive(input) {
  return (
    input === null ||
    input === undefined ||
    typeof input === "boolean" ||
    typeof input === "number" ||
    typeof input === "string"
  );
}
