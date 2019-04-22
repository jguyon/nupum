import invariant from "tiny-invariant";
import {
  IS_RESOURCE,
  IS_RESOURCE_CACHE,
  RESOURCE_FETCH,
  RESOURCE_HASH,
  RESOURCE_CACHE_FETCH,
  RESOURCE_PENDING,
  RESOURCE_SUCCESS,
  RESOURCE_FAILURE,
} from "./constants";

export default function createClientResourceCache() {
  const entries = new Map();

  return {
    [IS_RESOURCE_CACHE]: true,
    [RESOURCE_CACHE_FETCH]: (resource, input) =>
      fetchEntry(entries, resource, input),
    preload: (resource, input) => preloadEntry(entries, resource, input),
  };
}

function fetchEntry(entries, resource, input) {
  invariant(
    resource && typeof resource === "object" && resource[IS_RESOURCE],
    "expected resource to be an object returned by `createResource`",
  );

  const resourceEntries = getResourceEntries(entries, resource);
  const hash = resource[RESOURCE_HASH](input);
  const entry = resourceEntries.get(hash);

  if (entry) {
    return entry;
  } else {
    return createResourceEntry(
      resourceEntries,
      hash,
      resource[RESOURCE_FETCH](input),
    );
  }
}

function getResourceEntries(entries, resource) {
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
  const entryPromise = promise.then(
    data => {
      const successEntry = {
        status: RESOURCE_SUCCESS,
        data,
      };

      resourceEntries.set(hash, successEntry);
      return successEntry;
    },
    error => {
      const failureEntry = {
        status: RESOURCE_FAILURE,
        error,
      };

      resourceEntries.set(hash, failureEntry);
      return failureEntry;
    },
  );

  const pendingEntry = {
    status: RESOURCE_PENDING,
    listen: cb => {
      let isCanceled = false;

      entryPromise.then(result => {
        if (!isCanceled) {
          cb(result);
        }
      });

      return () => {
        isCanceled = true;
      };
    },
  };

  resourceEntries.set(hash, pendingEntry);
  return pendingEntry;
}

function preloadEntry(entries, resource, input) {
  const result = fetchEntry(entries, resource, input);

  if (result.status === RESOURCE_PENDING) {
    return new Promise(resolve => {
      result.listen(() => {
        resolve();
      });
    });
  } else {
    return result;
  }
}
