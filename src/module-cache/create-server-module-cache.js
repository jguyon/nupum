import invariant from "tiny-invariant";
import {
  IS_MODULE,
  MODULE_FETCH,
  MODULE_CHUNK_NAME,
  IS_MODULE_CACHE,
  MODULE_CACHE_FETCH,
  MODULE_PENDING,
  MODULE_SUCCESS,
  MODULE_FAILURE,
} from "./constants";

export default function createServerModuleCache() {
  const entries = new Map();
  const chunks = new Set();

  return {
    [IS_MODULE_CACHE]: true,
    [MODULE_CACHE_FETCH]: module => fetchEntry(entries, module),
    preload: module => preloadEntry(entries, chunks, module),
    chunks: () => [...chunks],
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
    const pendingEntry = {
      status: MODULE_PENDING,
      listen: () => {
        invariant(
          "cannot listen to entry of server module cache\n" +
            "did you try to use a server module cache " +
            "outside a server-rendering context?",
        );
      },
    };

    entries.set(pendingEntry);
    return pendingEntry;
  }
}

function preloadEntry(entries, chunks, module) {
  invariant(
    module && typeof module === "object" && module[IS_MODULE],
    "expected module to be an object returned by `createModule`",
  );

  const entry = entries.get(module);

  if (entry) {
    if (entry.status === MODULE_PENDING) {
      return new Promise(resolve => {
        entry.listen(() => {
          resolve();
        });
      });
    } else {
      return Promise.resolve();
    }
  } else {
    const promise = module[MODULE_FETCH]();
    invariant(
      promise instanceof Promise,
      "expected module fetch function to return a promise",
    );

    const chunkName = module[MODULE_CHUNK_NAME];
    invariant(
      chunkName,
      "expected module chunk name to be present\n" +
        "did you try preloading a module without specifying a chunk name?",
    );

    chunks.add(chunkName);
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
  return entryPromise.then(() => {});
}
