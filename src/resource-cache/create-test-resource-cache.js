import invariant from "tiny-invariant";
import {
  IS_RESOURCE,
  RESOURCE_HASH,
  IS_RESOURCE_CACHE,
  RESOURCE_CACHE_FETCH,
  RESOURCE_PENDING,
  RESOURCE_SUCCESS,
  RESOURCE_FAILURE,
} from "./constants";

export default function createTestResourceCache() {
  const entries = new Map();

  function fetch(resource, input) {
    invariant(
      resource && typeof resource === "object" && resource[IS_RESOURCE],
      "expected resource to be an object returned by `createResource`",
    );

    const resourceEntries = getResourceEntries(resource);
    const hash = resource[RESOURCE_HASH](input);
    const entry = resourceEntries.get(hash);

    if (entry) {
      return entry;
    } else {
      return createEntry(resourceEntries, hash);
    }
  }

  function createEntry(resourceEntries, hash) {
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

    function succeed(data) {
      if (subscribers) {
        const successEntry = {
          status: RESOURCE_SUCCESS,
          data,
        };

        resourceEntries.set(hash, successEntry);
        for (const cb of subscribers) {
          cb(successEntry);
        }
        subscribers = null;
      }
    }

    function fail(error) {
      if (subscribers) {
        const failureEntry = {
          status: RESOURCE_FAILURE,
          error,
        };

        resourceEntries.set(hash, failureEntry);
        for (const cb of subscribers) {
          cb(failureEntry);
        }
        subscribers = null;
      }
    }

    const pendingEntry = {
      status: RESOURCE_PENDING,
      listen,
      succeed,
      fail,
    };

    resourceEntries.set(hash, pendingEntry);
    return pendingEntry;
  }

  function preload(resource, input) {
    const entry = fetch(resource, input);

    if (entry.status === RESOURCE_PENDING) {
      return new Promise(resolve => {
        entry.listen(resolve);
      });
    } else {
      return Promise.resolve(entry);
    }
  }

  function succeed(resource, input, data) {
    const entry = getPendingEntry(resource, input);
    entry.succeed(data);
  }

  function fail(resource, input, error) {
    const entry = getPendingEntry(resource, input);
    entry.fail(error);
  }

  function getPendingEntry(resource, input) {
    const resourceEntries = getResourceEntries(resource);
    const hash = resource[RESOURCE_HASH](input);
    const entry = resourceEntries.get(hash);

    invariant(entry, "expected resource to have been fetched with given input");
    invariant(
      entry.status === RESOURCE_PENDING,
      "expected resource to not have been succeeded or failed " +
        "with given input before",
    );

    return entry;
  }

  function getResourceEntries(resource) {
    const resourceEntries = entries.get(resource);

    if (resourceEntries) {
      return resourceEntries;
    } else {
      const newResourceEntries = new Map();
      entries.set(resource, newResourceEntries);
      return newResourceEntries;
    }
  }

  return {
    [IS_RESOURCE_CACHE]: true,
    [RESOURCE_CACHE_FETCH]: fetch,
    preload,
    succeed,
    fail,
  };
}
