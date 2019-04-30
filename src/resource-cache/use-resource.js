import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import invariant from "tiny-invariant";
import {
  IS_RESOURCE,
  IS_RESOURCE_CACHE,
  RESOURCE_CACHE_FETCH,
  RESOURCE_PENDING,
} from "./constants";

// IMPORTANT NOTE:
// The input is checked for strict equality, so if it is not a primitive type
// it needs to be returned from a useMemo call. Otherwise strange errors are
// going to be thrown.
export default function useResource(resource, input) {
  invariant(
    resource === null ||
      (typeof resource === "object" && resource[IS_RESOURCE]),
    "expected resource to be an object returned by `createResource` or null",
  );

  const cache = useResourceCache();
  const [state, dispatch] = useReducer(
    reducer,
    { cache, resource, input },
    initializer,
  );

  if (
    cache !== state.cache ||
    resource !== state.resource ||
    // Object.is is used because the input could be NaN
    !Object.is(input, state.input)
  ) {
    dispatch({
      type: ACTION_UPDATE,
      cache,
      resource,
      input,
    });
  }

  useEffect(() => {
    if (state.entry && state.entry.status === RESOURCE_PENDING) {
      const unlisten = state.entry.listen(nextEntry => {
        dispatch({
          type: ACTION_RESOLVE,
          nextEntry,
          prevEntry: state.entry,
        });
      });

      return unlisten;
    }
  }, [state.entry]);

  return useMemo(() => {
    if (!state.entry || state.entry.status === RESOURCE_PENDING) {
      return {
        status: RESOURCE_PENDING,
      };
    } else {
      return state.entry;
    }
  }, [state.entry]);
}

function initializer({ cache, resource, input }) {
  const entry = resource ? cache[RESOURCE_CACHE_FETCH](resource, input) : null;

  return {
    cache,
    resource,
    input,
    entry,
  };
}

const ACTION_UPDATE = Symbol("ACTION_UPDATE");
const ACTION_RESOLVE = Symbol("ACTION_RESOLVE");

function reducer(state, action) {
  switch (action.type) {
    case ACTION_UPDATE: {
      const { cache, resource, input } = action;
      return initializer({ cache, resource, input });
    }

    case ACTION_RESOLVE: {
      const { prevEntry, nextEntry } = action;
      const { cache, resource, input, entry: currentEntry } = state;

      if (prevEntry === currentEntry) {
        return {
          cache,
          resource,
          input,
          entry: nextEntry,
        };
      } else {
        return state;
      }
    }

    default: {
      invariant(false, `invalid action type ${action.type}`);
    }
  }
}

const ResourceCacheContext = createContext(null);

export function ResourceCacheProvider({ cache, children }) {
  invariant(
    cache && typeof cache === "object" && cache[IS_RESOURCE_CACHE],
    "expected cache to be an object returned by `create*ResourceCache`",
  );

  return (
    <ResourceCacheContext.Provider value={cache}>
      {children}
    </ResourceCacheContext.Provider>
  );
}

ResourceCacheProvider.propTypes = {
  cache: PropTypes.object.isRequired,
  children: PropTypes.node,
};

function useResourceCache() {
  const cache = useContext(ResourceCacheContext);
  invariant(
    cache,
    "`useResource` can only be used inside a <ResourceCacheProvider/>",
  );

  return cache;
}
