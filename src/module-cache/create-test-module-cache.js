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

export default function createTestResourceCache() {
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
    let subscribers = [];

    function listen(cb) {
      if (subscribers) {
        subscribers.push(cb);
      }

      return () => {
        if (subscribers) {
          const index = subscribers.indexOf(cb);
          if (index > -1) {
            subscribers.splice(index, 1);
          }
        }
      };
    }

    async function wait() {
      if (subscribers) {
        const data = await module[MODULE_FETCH]();

        if (subscribers) {
          const successEntry = {
            status: MODULE_SUCCESS,
            module: data,
          };

          entries.set(module, successEntry);
          for (const cb of subscribers) {
            cb(successEntry);
          }
          subscribers = null;
        }
      }
    }

    function fail(error) {
      if (subscribers) {
        const failureEntry = {
          status: MODULE_FAILURE,
          error,
        };

        entries.set(module, failureEntry);
        for (const cb of subscribers) {
          cb(failureEntry);
        }
        subscribers = null;
      }
    }

    const pendingEntry = {
      status: MODULE_PENDING,
      listen,
      wait,
      fail,
    };

    entries.set(module, pendingEntry);
    return pendingEntry;
  }

  function preload(module) {
    const entry = fetch(module);

    if (entry.status === MODULE_PENDING) {
      return new Promise(resolve => {
        entry.listen(resolve);
      });
    } else {
      return Promise.resolve();
    }
  }

  function wait(module) {
    const entry = getPendingEntry(module);
    return entry.wait();
  }

  function waitAll() {
    return Promise.all(
      [...entries.values()]
        .filter(entry => entry.status === MODULE_PENDING)
        .map(entry => entry.wait()),
    ).then(() => {});
  }

  function fail(module, error) {
    const entry = getPendingEntry(module);
    return entry.fail(error);
  }

  function getPendingEntry(module) {
    const entry = entries.get(module);

    invariant(entry, "expected module to have been fetched");
    invariant(
      entry.status === MODULE_PENDING,
      "expected module not to have been waited on before",
    );

    return entry;
  }

  return {
    [IS_MODULE_CACHE]: true,
    [MODULE_CACHE_FETCH]: fetch,
    preload,
    wait,
    waitAll,
    fail,
  };
}
