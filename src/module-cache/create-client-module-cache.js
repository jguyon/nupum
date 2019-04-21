import invariant from "tiny-invariant";
import {
  IS_MODULE,
  MODULE_FETCH,
  IS_MODULE_CACHE,
  MODULE_CACHE_FETCH,
  MODULE_PENDING,
  MODULE_SUCCESS,
  MODULE_FAILURE,
} from "./constants";

export default function createClientModuleCache() {
  const entries = new Map();

  return {
    [IS_MODULE_CACHE]: true,
    [MODULE_CACHE_FETCH]: module => fetchEntry(entries, module),
  };
}

function fetchEntry(entries, module) {
  invariant(
    module && typeof module === "object" && module[IS_MODULE],
    "expected module to be an object returned by `createModule`",
  );

  const entry = entries.get(module);

  if (entry) {
    return entry;
  } else {
    const promise = module[MODULE_FETCH]();
    invariant(
      promise instanceof Promise,
      "expected module.fetch() to return a promise",
    );

    return createEntry(entries, module, promise);
  }
}

function createEntry(entries, module, promise) {
  const entryPromise = promise.then(
    data => {
      const successEntry = {
        status: MODULE_SUCCESS,
        module: data,
      };

      entries.set(module, successEntry);
      return successEntry;
    },
    error => {
      const failureEntry = {
        status: MODULE_FAILURE,
        error,
      };

      entries.set(module, failureEntry);
      return failureEntry;
    },
  );

  const pendingEntry = {
    status: MODULE_PENDING,
    listen: cb => {
      entryPromise.then(cb);
    },
  };

  entries.set(module, pendingEntry);
  return pendingEntry;
}
