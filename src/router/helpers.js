import invariant from "tiny-invariant";
import warning from "tiny-warning";

export function matchPath(path, uri) {
  invariant(typeof path === "string", "expected path to be a string");
  invariant(typeof uri === "string", "expected uri to be a string");

  return matchSegments(segmentize(path), segmentize(uri));
}

export function matchRoutes(routes, uri) {
  invariant(Array.isArray(routes), "expected routes to be an array");
  invariant(typeof uri === "string", "expected uri to be a string");

  const uriSegments = segmentize(uri);

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];

    invariant(typeof route === "object", "expected route to be an object");
    invariant(
      typeof route.path === "string",
      "expected route.path to be a string",
    );

    const match = matchSegments(segmentize(route.path), uriSegments);

    if (match) {
      const children =
        match.childUri !== null && route.routes
          ? matchRoutes(route.routes, match.childUri)
          : [];

      return [{ ...match, route }, ...children];
    }
  }

  return [];
}

function segmentize(path) {
  return path.split("/").filter(segment => segment !== "");
}

function matchSegments(pathSegments, uriSegments) {
  const length = Math.max(pathSegments.length, uriSegments.length);

  const params = {};
  let childUri = null;
  let i = 0;

  for (; i < length; i++) {
    if (i >= pathSegments.length) {
      return null;
    }

    const pathSegment = pathSegments[i];

    if (pathSegment === "*") {
      childUri = uriSegments.slice(i).join("/");
      break;
    }

    if (i >= uriSegments.length) {
      return null;
    }

    const uriSegment = uriSegments[i];

    if (/^:.+/.test(pathSegment)) {
      const name = pathSegment.slice(1);

      warning(
        params[name] === undefined,
        `param :${name} is used multiple times in path ` +
          JSON.stringify(`/${pathSegments.join("/")}`),
      );

      params[name] = decodeURIComponent(uriSegment);
      continue;
    }

    if (pathSegment !== uriSegment) {
      return null;
    }
  }

  return {
    params,
    uri: uriSegments.slice(0, i).join("/"),
    childUri,
  };
}
