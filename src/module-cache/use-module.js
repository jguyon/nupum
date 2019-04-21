import React, {
  useReducer,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from "react";
import PropTypes from "prop-types";
import invariant from "tiny-invariant";
import {
  IS_MODULE,
  IS_MODULE_CACHE,
  MODULE_CACHE_FETCH,
  MODULE_PENDING,
} from "./constants";

export default function useModule(module) {
  invariant(
    module && typeof module === "object" && module[IS_MODULE],
    "expected module to be an object returned by `createModule`",
  );

  const cache = useModuleCache();
  const [state, dispatch] = useReducer(reducer, { module, cache }, initializer);

  if (module !== state.module || cache !== state.cache) {
    dispatch({
      type: ACTION_UPDATE,
      module,
      cache,
    });
  }

  useEffect(() => {
    if (state.entry.status === MODULE_PENDING) {
      let isCanceled = false;

      state.entry.listen(nextEntry => {
        if (!isCanceled) {
          dispatch({
            type: ACTION_RESOLVE,
            nextEntry,
            prevEntry: state.entry,
          });
        }
      });

      return () => {
        isCanceled = true;
      };
    }
  }, [state.entry]);

  return useMemo(() => {
    // pending entries have shape { status, promise },
    // but we don't want to return the promise
    if (state.entry.status === MODULE_PENDING) {
      return {
        status: MODULE_PENDING,
      };
    } else {
      return state.entry;
    }
  }, [state.entry]);
}

function initializer({ cache, module }) {
  const entry = cache[MODULE_CACHE_FETCH](module);

  return {
    cache,
    module,
    entry,
  };
}

const ACTION_UPDATE = Symbol("ACTION_UPDATE");
const ACTION_RESOLVE = Symbol("ACTION_RESOLVE");

function reducer(state, action) {
  switch (action.type) {
    case ACTION_UPDATE: {
      const { cache, module } = action;
      const entry = cache[MODULE_CACHE_FETCH](module);

      return {
        cache,
        module,
        entry,
      };
    }

    case ACTION_RESOLVE: {
      const { nextEntry, prevEntry } = action;
      const { cache, module, entry: currentEntry } = state;

      if (prevEntry === currentEntry) {
        return {
          cache,
          module,
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

const ModuleCacheContext = createContext(null);

export function ModuleCacheProvider({ cache, children }) {
  invariant(
    cache && typeof cache === "object" && cache[IS_MODULE_CACHE],
    "expected cache to be an object returned by `create*ModuleCache`",
  );

  return (
    <ModuleCacheContext.Provider value={cache}>
      {children}
    </ModuleCacheContext.Provider>
  );
}

ModuleCacheProvider.propTypes = {
  cache: PropTypes.object.isRequired,
  children: PropTypes.node,
};

function useModuleCache() {
  const cache = useContext(ModuleCacheContext);
  invariant(
    cache,
    "`useModuleCache` can only be used inside a <ModuleCacheProvider/>",
  );

  return cache;
}
