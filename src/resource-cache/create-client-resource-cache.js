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
  SERIALIZED_SUCCESS,
  SERIALIZED_FAILURE,
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
        return fetchResourceEntry(resourceEntries, resource, input, hash);
      } else {
        return value;
      }
    } else {
      return fetchResourceEntry(resourceEntries, resource, input, hash);
    }
  }

  function fetchResourceEntry(resourceEntries, resource, input, hash) {
    const resultPromise = resource[RESOURCE_FETCH](input).then(
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

    const entry = createResourceEntry(resourceEntries, hash, pendingResult);
    return pendingResult;
  }

  function preload(resource, input) {
    const result = fetch(resource, input);

    if (result.status === RESOURCE_PENDING) {
      return new Promise(resolve => {
        result.listen(resolve);
      });
    } else {
      return Promise.resolve();
    }
  }

  function populate(resourcesToPopulate, serializedEntries) {
    invariant(
      resourcesToPopulate && typeof resourcesToPopulate === "object",
      "expected resourceToPopulate to be an object",
    );
    invariant(
      serializedEntries && typeof serializedEntries === "object",
      "expected serializedEntries to be an object",
    );

    for (const resourceName of Object.keys(serializedEntries)) {
      const resource = resourcesToPopulate[resourceName];
      invariant(
        resource && typeof resource === "object" && resource[IS_RESOURCE],
        `expected resourcesToPopulate[${JSON.stringify(resourceName)}] ` +
          "to be an object returned by `createResource`",
      );

      const serializedResourceEntries = serializedEntries[resourceName];
      const resourceEntries = getResourceEntries(resource);

      for (const [hash, status, data] of serializedResourceEntries) {
        const result = (() => {
          if (status === SERIALIZED_SUCCESS) {
            return {
              status: RESOURCE_SUCCESS,
              data,
            };
          } else if (status === SERIALIZED_FAILURE) {
            return {
              status: RESOURCE_FAILURE,
              error: data,
            };
          } else {
            invariant(false, `invalid serialized entry status ${status}`);
          }
        })();

        createResourceEntry(resourceEntries, hash, result);
      }
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

  function createResourceEntry(resourceEntries, hash, result) {
    const entry = lru.add(result, () => resourceEntries.delete(hash));
    resourceEntries.set(hash, entry);
    return entry;
  }

  return {
    [IS_RESOURCE_CACHE]: true,
    [RESOURCE_CACHE_FETCH]: fetch,
    preload,
    populate,
  };
}
