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

  function fetch(module) {
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
        listen,
      };

      entries.set(module, pendingEntry);
      return pendingEntry;
    }
  }

  function preload(module) {
    invariant(
      module && typeof module === "object" && module[IS_MODULE],
      "expected module to be an object returned by `createModule`",
    );

    const entry = entries.get(module);

    if (entry) {
      if (entry.status === MODULE_PENDING) {
        if (entry.promise) {
          return entry.promise;
        } else {
          return createEntry(module);
        }
      } else {
        return Promise.resolve(entry);
      }
    } else {
      return createEntry(module);
    }
  }

  function createEntry(module) {
    const chunkName = module[MODULE_CHUNK_NAME];
    invariant(
      chunkName,
      "expected module chunk name to be present\n" +
        "did you try preloading a module without specifying a chunk name?",
    );

    chunks.add(chunkName);

    const entryPromise = module[MODULE_FETCH]().then(
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
      listen,
      promise: entryPromise,
    };

    entries.set(module, pendingEntry);
    return entryPromise;
  }

  function listen() {
    invariant(
      false,
      "cannot listen to entry of server module cache\n" +
        "did you try to use a server module cache " +
        "outside a server-rendering context?",
    );
  }

  return {
    [IS_MODULE_CACHE]: true,
    [MODULE_CACHE_FETCH]: fetch,
    preload,
    chunks: () => [...chunks],
  };
}
