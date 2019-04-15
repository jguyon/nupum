import React, {
  useReducer,
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import invariant from "tiny-invariant";
import warning from "tiny-warning";
import { createLocation } from "history";
import { matchPath, matchRoutes, preloadMatches } from "./helpers";

export default function Router({
  history,
  routes,
  preloadTimeout = 0,
  preloadProps = {},
}) {
  const { location, action, matches } = usePreloadingRouter(
    preloadTimeout,
    preloadProps,
    useRouter(history, routes),
  );

  return (
    <NavigateProvider history={history}>
      <PreloadProvider routes={routes} props={preloadProps}>
        <MatchProvider location={location}>
          {matches.reduceRight(
            (children, { route, params }) =>
              route.render({
                location,
                action,
                params,
                children,
              }),
            null,
          )}
        </MatchProvider>
      </PreloadProvider>
    </NavigateProvider>
  );
}

Router.propTypes = {
  history: PropTypes.object.isRequired,
  preloadTimeout: PropTypes.number,
  preloadProps: PropTypes.object,
  routes: (() => {
    // The route type is defined recursively (routes can have routes),
    // this hack makes it work.
    const routeShape = {
      path: PropTypes.string.isRequired,
      render: PropTypes.func.isRequired,
      preload: PropTypes.func,
    };
    const routesPropType = PropTypes.arrayOf(
      PropTypes.shape(routeShape).isRequired,
    );
    routeShape.routes = routesPropType;
    return routesPropType.isRequired;
  })(),
};

function useRouter(history, routes) {
  const [state, dispatch] = useReducer(
    routerReducer,
    { history, routes },
    routerInitializer,
  );

  if (routes !== state.routes) {
    dispatch({
      type: ROUTER_ACTION_ROUTES_CHANGE,
      routes,
    });
  }

  useEffect(() => {
    dispatch({
      type: ROUTER_ACTION_HISTORY_CHANGE,
      location: history.location,
      action: history.action,
    });

    const unlisten = history.listen((location, action) => {
      dispatch({
        type: ROUTER_ACTION_HISTORY_CHANGE,
        location,
        action,
      });
    });

    return unlisten;
  }, [history]);

  return state;
}

function routerInitializer({ history, routes }) {
  const { location, action } = history;
  const matches = matchRoutes(routes, location.pathname);

  return {
    routes,
    location,
    action,
    matches,
  };
}

const ROUTER_ACTION_HISTORY_CHANGE = Symbol("ROUTER_ACTION_HISTORY_CHANGE");
const ROUTER_ACTION_ROUTES_CHANGE = Symbol("ROUTER_ACTION_ROUTES_CHANGE");

function routerReducer(state, action) {
  switch (action.type) {
    case ROUTER_ACTION_HISTORY_CHANGE: {
      const { routes, location: prevLocation, action: prevAction } = state;
      const { location: nextLocation, action: nextAction } = action;

      if (nextLocation !== prevLocation || nextAction !== prevAction) {
        const nextMatches = matchRoutes(routes, nextLocation.pathname);

        return {
          ...state,
          location: nextLocation,
          action: nextAction,
          matches: nextMatches,
        };
      } else {
        return state;
      }
    }

    case ROUTER_ACTION_ROUTES_CHANGE: {
      const { location } = state;
      const { routes } = action;
      const matches = matchRoutes(routes, location.pathname);

      return {
        ...state,
        routes,
        matches,
      };
    }

    default: {
      invariant(false, `invalid action type: ${action.type}`);
    }
  }
}

export function preloadRoutes(history, routes, props = {}) {
  warning(
    props.location === undefined,
    `"location" preload prop will be erased`,
  );
  warning(props.action === undefined, `"action" preload prop will be erased`);

  const { location, action } = history;

  return preloadMatches(matchRoutes(routes, location.pathname), {
    ...props,
    location,
    action,
  });
}

function usePreloadingRouter(timeout, props, routerState) {
  warning(
    props.location === undefined,
    `"location" preload prop will be erased`,
  );
  warning(props.action === undefined, `"action" preload prop will be erased`);

  const [currentState, setCurrentState] = useState(routerState);

  if (timeout <= 0 && routerState !== currentState) {
    setCurrentState(routerState);
  }

  useEffect(() => {
    if (routerState !== currentState) {
      const { location, action, matches } = routerState;
      let isCanceled = false;

      preloadMatches(matches, {
        ...props,
        location,
        action,
      })
        .catch(error => {
          console.error("preload error:", error);
        })
        .then(() => {
          if (!isCanceled) {
            setCurrentState(routerState);
          }
        });

      return () => {
        isCanceled = true;
      };
    }
  }, [routerState, currentState, props]);

  useEffect(() => {
    if (routerState !== currentState) {
      const timeoutId = setTimeout(() => {
        setCurrentState(routerState);
      }, timeout);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [routerState, currentState, timeout]);

  return currentState;
}

const NavigateContext = createContext(null);

function NavigateProvider({ history, children }) {
  const navigate = useCallback(
    (path, { state, replace = false } = {}) => {
      invariant(typeof path === "string", "expected path to be a string");
      invariant(path[0] === "/", "expected path to be absolute");

      if (replace) {
        history.replace(path, state);
      } else {
        history.push(path, state);
      }
    },
    [history],
  );

  return (
    <NavigateContext.Provider value={navigate}>
      {children}
    </NavigateContext.Provider>
  );
}

export function useNavigate() {
  const navigate = useContext(NavigateContext);
  invariant(navigate, "`useNavigate` can only be used inside a <Router/>");
  return navigate;
}

const PreloadContext = createContext(null);

function PreloadProvider({ routes, props, children }) {
  const preload = useCallback(
    (path, { state } = {}) => {
      invariant(typeof path === "string", "expected path to be a string");
      invariant(path[0] === "/", "expected path to be absolute");

      const location = createLocation(path, state);
      const action = "PRELOAD";

      preloadMatches(matchRoutes(routes, location.pathname), {
        ...props,
        location,
        action,
      }).catch(error => {
        console.error("preload error:", error);
      });
    },
    [routes, props],
  );

  return (
    <PreloadContext.Provider value={preload}>
      {children}
    </PreloadContext.Provider>
  );
}

export function usePreload() {
  const preload = useContext(PreloadContext);
  invariant(preload, "`usePreload` can only be used inside a <Router/>");
  return preload;
}

const MatchContext = createContext(null);

function MatchProvider({ location, children }) {
  const match = useCallback(
    path => {
      invariant(typeof path === "string", "expected path to be a string");
      invariant(path[0] === "/", "expected path to be absolute");

      const maybeMatch = matchPath(path, location.pathname);

      if (maybeMatch) {
        const { params } = maybeMatch;

        return {
          params,
          location,
        };
      } else {
        return null;
      }
    },
    [location],
  );

  return (
    <MatchContext.Provider value={match}>{children}</MatchContext.Provider>
  );
}

export function useMatch(path) {
  const match = useContext(MatchContext);
  invariant(match, "`useMatch` can only be used inside a <Router/>");

  return useMemo(() => match(path), [path, match]);
}
