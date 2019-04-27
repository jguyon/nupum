import invariant from "tiny-invariant";
import { IS_MODULE, MODULE_FETCH, MODULE_CHUNK_NAME } from "./constants";

export default function createModule(fetch, chunkName) {
  invariant(
    !chunkName || typeof chunkName === "string",
    "expected chunkName to be falsy or a string",
  );

  return {
    [IS_MODULE]: true,
    [MODULE_FETCH]: wrapFetch(fetch),
    [MODULE_CHUNK_NAME]: chunkName,
  };
}

function wrapFetch(fetch) {
  invariant(typeof fetch === "function", "expected fetch to be a function");

  return () => {
    const promise = fetch();
    invariant(
      promise instanceof Promise,
      "expected fetch function to return a promise",
    );

    return promise;
  };
}
