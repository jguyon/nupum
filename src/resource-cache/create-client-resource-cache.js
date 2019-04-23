import invariant from "tiny-invariant";
import {
  IS_RESOURCE,
  RESOURCE_FETCH,
  RESOURCE_HASH,
  LRU_EVICTED_ENTRY,
  IS_RESOURCE_CACHE,
  RESOURCE_CACHE_FETCH,
  RESOURCE_PENDING,
  RESOURCE_SUCCESS,
  RESOURCE_FAILURE,
} from "./constants";
import createLRU from "./create-lru";

export default function createClientResourceCache(opts) {
  const entries = new Map();
  const lru = createLRU(opts);

  function fetch(resource, input) {
    invariant(
      resource && typeof resource === "object" && resource[IS_RESOURCE],
      "expected resource to be an object returned by `createResource`",
    );

    const resourceEntries = getResourceEntries(resource);
    const hash = resource[RESOURCE_HASH](input);
    const entry = resourceEntries.get(hash);

    if (entry) {
      const value = lru.access(entry);

      if (value === LRU_EVICTED_ENTRY) {
        return createResourceEntry(
          resourceEntries,
          hash,
          resource[RESOURCE_FETCH](input),
        );
      } else {
        return value;
      }
    } else {
      return createResourceEntry(
        resourceEntries,
        hash,
        resource[RESOURCE_FETCH](input),
      );
    }
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

  function createResourceEntry(resourceEntries, hash, promise) {
    const resultPromise = promise.then(
      data => {
        const successResult = {
          status: RESOURCE_SUCCESS,
          data,
        };

        lru.update(entry, successResult);
        return successResult;
      },
      error => {
        const failureResult = {
          status: RESOURCE_FAILURE,
          error,
        };

        lru.update(entry, failureResult);
        return failureResult;
      },
    );

    const pendingResult = {
      status: RESOURCE_PENDING,
      listen: cb => {
        let isCanceled = false;

        resultPromise.then(result => {
          if (!isCanceled) {
            cb(result);
          }
        });

        return () => {
          isCanceled = true;
        };
      },
    };

    const entry = lru.add(pendingResult, () => resourceEntries.delete(hash));
    resourceEntries.set(hash, entry);
    return pendingResult;
  }

  function preload(resource, input) {
    const result = fetch(resource, input);

    if (result.status === RESOURCE_PENDING) {
      return new Promise(resolve => {
        result.listen(() => {
          resolve();
        });
      });
    } else {
      return Promise.resolve();
    }
  }

  return {
    [IS_RESOURCE_CACHE]: true,
    [RESOURCE_CACHE_FETCH]: fetch,
    preload,
  };
}
