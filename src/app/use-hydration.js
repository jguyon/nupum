import React, { createContext, useContext, useState, useEffect } from "react";
import invariant from "tiny-invariant";
import PropTypes from "prop-types";

const HydrationContext = createContext(false);

// Useful for rendering a different thing if we're server-rendering or to run
// specific code on hydration.
// Works by returning true for the very first render of the app (server
// rendering or hydration), immediately re-rendering, and returning false on
// all subsequent renders.
// The hydrate callback is executed (you guessed it) on hydration.
export default function useHydration(hydrate) {
  invariant(
    !hydrate || typeof hydrate === "function",
    "expected hydrate to be a function",
  );

  const isHydrating = useContext(HydrationContext);

  useEffect(
    () => {
      if (isHydrating && hydrate) {
        hydrate();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return isHydrating;
}

export function HydrationProvider({ children }) {
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  return (
    <HydrationContext.Provider value={isFirstRender}>
      {children}
    </HydrationContext.Provider>
  );
}

HydrationProvider.propTypes = {
  children: PropTypes.node,
};
