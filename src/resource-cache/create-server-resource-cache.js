import invariant from "tiny-invariant";
import {
  IS_RESOURCE,
  RESOURCE_FETCH,
  RESOURCE_HASH,
  IS_RESOURCE_CACHE,
  RESOURCE_CACHE_FETCH,
  RESOURCE_PENDING,
  RESOURCE_SUCCESS,
  RESOURCE_FAILURE,
  SERIALIZED_SUCCESS,
  SERIALIZED_FAILURE,
} from "./constants";

export default function createServerResourceCache(resourcesToPreload) {
  invariant(
    resourcesToPreload && typeof resourcesToPreload === "object",
    "expected resourcesToPreload to be an object",
  );

  const entries = new Map();
  const resourceNames = new Map();

  for (const resourceName of Object.keys(resourcesToPreload)) {
    invariant(
      typeof resourceName === "string",
      `expected resource name to be a string but got ${resourceName}`,
    );

    const resource = resourcesToPreload[resourceName];
    invariant(
      resource && typeof resource === "object" && resource[IS_RESOURCE],
      `expected resourcesToPreload[${JSON.stringify(resourceName)}] ` +
        "to be an object returned by `createResource`",
    );

    resourceNames.set(resource, resourceName);
  }

  function fetch(resource, input) {
    const resourceEntries = getResourceEntries(resource);
    const hash = resource[RESOURCE_HASH](input);
    const entry = resourceEntries.get(hash);

    if (entry) {
      return entry;
    } else {
      const pendingEntry = {
        status: RESOURCE_PENDING,
        listen,
      };

      resourceEntries.set(hash, pendingEntry);
      return pendingEntry;
    }
  }

  function preload(resource, input) {
    const resourceEntries = getResourceEntries(resource);
    const hash = resource[RESOURCE_HASH](input);
    const entry = resourceEntries.get(hash);

    if (entry) {
      if (entry.status === RESOURCE_PENDING) {
        if (entry.promise) {
          return entry.promise;
        } else {
          checkResourceToPreload(resource);

          return createResourceEntry(
            resourceEntries,
            hash,
            resource[RESOURCE_FETCH](input),
          );
        }
      } else {
        return Promise.resolve(entry);
      }
    } else {
      checkResourceToPreload(resource);

      return createResourceEntry(
        resourceEntries,
        hash,
        resource[RESOURCE_FETCH](input),
      );
    }
  }

  function getResourceEntries(resource) {
    invariant(
      resource && typeof resource === "object" && resource[IS_RESOURCE],
      "expected resource to be an object returned by `createResource`",
    );

    const resourceEntries = entries.get(resource);

    if (resourceEntries) {
      return resourceEntries;
    } else {
      const newResourceEntries = new Map();
      entries.set(resource, newResourceEntries);
      return newResourceEntries;
    }
  }

  function checkResourceToPreload(resource) {
    invariant(
      resourceNames.has(resource),
      "expected resource to have been specified as a resource to preload",
    );
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
      listen,
      promise: entryPromise,
    };

    resourceEntries.set(hash, pendingEntry);
    return entryPromise;
  }

  function listen() {
    invariant(
      false,
      "cannot listen to entry of server resource cache\n" +
        "did you try to use a server resource cache " +
        "outside a server-rendering context?",
    );
  }

  function serialize() {
    const serializedEntries = {};

    for (const [resource, resourceEntries] of entries.entries()) {
      const resourceName = resourceNames.get(resource);
      const serializedResourceEntries = [];

      for (const [hash, entry] of resourceEntries.entries()) {
        if (entry.status === RESOURCE_SUCCESS) {
          serializedResourceEntries.push([
            hash,
            SERIALIZED_SUCCESS,
            entry.data,
          ]);
        } else if (entry.status === RESOURCE_FAILURE) {
          serializedResourceEntries.push([
            hash,
            SERIALIZED_FAILURE,
            entry.error,
          ]);
        }
      }

      if (serializedResourceEntries.length > 0) {
        serializedEntries[resourceName] = serializedResourceEntries;
      }
    }

    return serializedEntries;
  }

  return {
    [IS_RESOURCE_CACHE]: true,
    [RESOURCE_CACHE_FETCH]: fetch,
    preload,
    serialize,
  };
}
