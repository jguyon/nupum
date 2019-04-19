import { createLocation, createPath } from "history";
import invariant from "invariant";

export const IS_STATIC_HISTORY = Symbol("IS_STATIC_HISTORY");

export default function createStaticHistory(path) {
  invariant(
    typeof path === "string" && path[0] === "/",
    "expected path to be an absolute url path",
  );

  const location = createLocation(
    path,
    undefined,
    Math.random()
      .toString(36)
      .substr(2, 6),
  );

  const history = {
    [IS_STATIC_HISTORY]: true,
    statusCode: null,
    length: 1,
    action: "POP",
    location,
    index: 0,
    entries: [location],
    createHref: createPath,
  };

  if (__DEV__) {
    [
      "push",
      "replace",
      "go",
      "goBack",
      "goForward",
      "canGo",
      "block",
      "listen",
    ].forEach(method => {
      history[method] = () => {
        invariant(
          false,
          `cannot call method "${method}" on static history\n` +
            "did you try to use a static history outside of a server-rendering context?",
        );
      };
    });
  }

  return history;
}
