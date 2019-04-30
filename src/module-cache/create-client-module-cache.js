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

  function fetch(module) {
    invariant(
      module && typeof module === "object" && module[IS_MODULE],
      "expected module to be an object returned by `createModule`",
    );

    const entry = entries.get(module);

    if (entry) {
      return entry;
    } else {
      return createEntry(module);
    }
  }

  function createEntry(module) {
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
      listen: cb => {
        let isCanceled = false;

        entryPromise.then(entry => {
          if (!isCanceled) {
            cb(entry);
          }
        });

        return () => {
          isCanceled = true;
        };
      },
    };

    entries.set(module, pendingEntry);
    return pendingEntry;
  }

  function preload(module) {
    const result = fetch(module);

    if (result.status === MODULE_PENDING) {
      return new Promise(resolve => {
        result.listen(resolve);
      });
    } else {
      return Promise.resolve();
    }
  }

  return {
    [IS_MODULE_CACHE]: true,
    [MODULE_CACHE_FETCH]: fetch,
    preload,
  };
}
