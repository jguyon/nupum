import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import PropTypes from "prop-types";
import { locationsAreEqual } from "history";
import invariant from "tiny-invariant";
import warning from "tiny-warning";

const LocationFocusContext = createContext(null);

const useClientLayoutEffect =
  process.env.TARGET === "client" ? useLayoutEffect : () => {};

export function LocationFocusProvider({ location, children }) {
  const focusRef = useRef(null);
  const [prevLocation, setPrevLocation] = useState(location);

  useClientLayoutEffect(() => {
    if (
      location !== prevLocation &&
      !locationsAreEqual(location, prevLocation)
    ) {
      setPrevLocation(location);
      const node = focusRef.current;

      if (node) {
        if (!node.contains(document.activeElement)) {
          node.focus();
        }
      } else {
        warning(
          false,
          "there is no element to focus\n" +
            "the ref needs to be added to an element",
        );
      }
    }
  }, [location, prevLocation]);

  return (
    <LocationFocusContext.Provider value={focusRef}>
      {children}
    </LocationFocusContext.Provider>
  );
}

LocationFocusProvider.propTypes = {
  location: PropTypes.object.isRequired,
  children: PropTypes.node,
};

export function useLocationFocus() {
  const focusRef = useContext(LocationFocusContext);

  invariant(
    focusRef,
    "`useLocationFocus` can only be used inside a <LocationFocusProvider/>",
  );

  return focusRef;
}
