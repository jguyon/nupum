import { matchPath, matchRoutes, preloadMatches } from "./helpers";

describe("matchPath", () => {
  test("root path matches root uri", () => {
    const match = matchPath("/", "/");

    expect(match).toEqual({
      params: {},
      uri: "",
      childUri: null,
    });
  });

  test("root path doesn't match non-root uri", () => {
    const match = matchPath("/", "/one");

    expect(match).toBe(null);
  });

  test("static path matches uri with same segments", () => {
    const match = matchPath("/one/two/three", "/one/two/three");

    expect(match).toEqual({
      params: {},
      uri: "one/two/three",
      childUri: null,
    });
  });

  test("static path doesn't match uri with different segments", () => {
    const match = matchPath("/one/two/three", "/one/four/three");

    expect(match).toBe(null);
  });

  test("static path doesn't match uri with less segments", () => {
    const match = matchPath("/one/two/three", "/one/two");

    expect(match).toBe(null);
  });

  test("static path doesn't match uri with more segments", () => {
    const match = matchPath("/one/two", "/one/two/three");

    expect(match).toBe(null);
  });

  test("dynamic path matches uri with same static segments", () => {
    const match = matchPath(
      "/one/:paramTwo/three/:paramFour",
      "/one/two/three/four",
    );

    expect(match).toEqual({
      params: { paramTwo: "two", paramFour: "four" },
      uri: "one/two/three/four",
      childUri: null,
    });
  });

  test("dynamic path doesn't match uri with different static segments", () => {
    const match = matchPath(
      "/one/:paramTwo/three/:paramFour",
      "/one/two/five/four",
    );

    expect(match).toBe(null);
  });

  test("dynamic path doesn't match uri less segments", () => {
    const match = matchPath(
      "/one/:paramTwo/three/:paramFour",
      "/one/two/three",
    );

    expect(match).toBe(null);
  });

  test("dynamic path doesn't match uri with more segments", () => {
    const match = matchPath(
      "/one/:paramTwo/three/:paramFour",
      "/one/two/three/four/five",
    );

    expect(match).toBe(null);
  });

  test("dynamic segments are decoded", () => {
    const match = matchPath("/:param", `/${encodeURIComponent("my/value")}`);

    expect(match).toEqual({
      params: { param: "my/value" },
      uri: encodeURIComponent("my/value"),
      childUri: null,
    });
  });

  test("segment with ':' in the middle is not treated as dynamic", () => {
    const match = matchPath("/non:param", "/value");

    expect(match).toBe(null);
  });

  test("segment with only ':' is not treated as dynamic", () => {
    const match = matchPath("/:", "/:");

    expect(match).toEqual({
      params: {},
      uri: ":",
      childUri: null,
    });
  });

  test("splat path matches uri with same segments", () => {
    const match = matchPath("/one/two/*", "/one/two");

    expect(match).toEqual({
      params: {},
      uri: "one/two",
      childUri: "",
    });
  });

  test("splat path matches uri with more segments", () => {
    const match = matchPath("/one/two/*", "/one/two/three/four");

    expect(match).toEqual({
      params: {},
      uri: "one/two",
      childUri: "three/four",
    });
  });

  test("splat path doesn't match uri with different segments", () => {
    const match = matchPath("/one/two/*", "/one/three/two");

    expect(match).toBe(null);
  });

  test("splat path doesn't match uri with less segments", () => {
    const match = matchPath("/one/two/*", "/one");

    expect(match).toBe(null);
  });

  test("splat path can be combined with dynamic segments", () => {
    const match = matchPath("/one/:param/three/*", "/one/two/three/four");

    expect(match).toEqual({
      params: { param: "two" },
      uri: "one/two/three",
      childUri: "four",
    });
  });

  test("segment with other characters than '*' is not treated as splat", () => {
    const match = matchPath("/*one", "/*one");

    expect(match).toEqual({
      params: {},
      uri: "*one",
      childUri: null,
    });
  });

  test("trailing '/' is eliminated from splat matching uri", () => {
    const match = matchPath("/*", "/one/");

    expect(match).toEqual({
      params: {},
      uri: "",
      childUri: "one",
    });
  });

  test("leading '/' character is optional", () => {
    const matchOne = matchPath("one", "/one");
    const matchTwo = matchPath("/two", "two");

    expect(matchOne).toEqual({
      params: {},
      uri: "one",
      childUri: null,
    });
    expect(matchTwo).toEqual({
      params: {},
      uri: "two",
      childUri: null,
    });
  });

  test("trailing '/' characters is optional", () => {
    const matchOne = matchPath("one", "one/");
    const matchTwo = matchPath("two/", "two");

    expect(matchOne).toEqual({
      params: {},
      uri: "one",
      childUri: null,
    });
    expect(matchTwo).toEqual({
      params: {},
      uri: "two",
      childUri: null,
    });
  });

  test("sequential '/' characters are deduplicated", () => {
    const matchOne = matchPath("///one///one///", "/one/one/");
    const matchTwo = matchPath("/two/two/", "///two///two///");

    expect(matchOne).toEqual({
      params: {},
      uri: "one/one",
      childUri: null,
    });
    expect(matchTwo).toEqual({
      params: {},
      uri: "two/two",
      childUri: null,
    });
  });
});

describe("matchRoutes", () => {
  test("empty array is returned when no matches are found", () => {
    const routes = [{ path: "/one" }, { path: "/two" }, { path: "/three" }];

    const matches = matchRoutes(routes, "/four");

    expect(matches).toEqual([]);
  });

  test("first match is returned", () => {
    const routes = [{ path: "/static" }, { path: "/:param" }, { path: "/*" }];

    const matches = matchRoutes(routes, "/dynamic");

    expect(matches).toEqual([
      {
        params: { param: "dynamic" },
        uri: "dynamic",
        childUri: null,
        route: routes[1],
      },
    ]);
  });

  test("children matches are returned with splat path", () => {
    const routes = [
      {
        path: "/parent/*",
        routes: [{ path: "/static" }, { path: "/:param" }, { path: "/*" }],
      },
    ];

    const matches = matchRoutes(routes, "/parent/dynamic");

    expect(matches).toEqual([
      {
        params: {},
        uri: "parent",
        childUri: "dynamic",
        route: routes[0],
      },
      {
        params: { param: "dynamic" },
        uri: "dynamic",
        childUri: null,
        route: routes[0].routes[1],
      },
    ]);
  });

  test("children matches are not returned with non-splat path", () => {
    const routes = [
      {
        path: "/parent",
        routes: [{ path: "/static" }, { path: "/:param" }, { path: "/*" }],
      },
    ];

    const matches = matchRoutes(routes, "/parent/dynamic");

    expect(matches).toEqual([]);
  });

  test("child root path is matched with splat path", () => {
    const routes = [
      {
        path: "/parent/*",
        routes: [{ path: "/" }],
      },
    ];

    const matches = matchRoutes(routes, "/parent");

    expect(matches).toEqual([
      {
        params: {},
        uri: "parent",
        childUri: "",
        route: routes[0],
      },
      {
        params: {},
        uri: "",
        childUri: null,
        route: routes[0].routes[0],
      },
    ]);
  });

  test("deep children matches are returned with deep splat paths", () => {
    const routes = [
      {
        path: "/one/*",
        routes: [
          {
            path: "/two/*",
            routes: [{ path: "/three" }],
          },
        ],
      },
    ];

    const matches = matchRoutes(routes, "/one/two/three");

    expect(matches).toEqual([
      {
        params: {},
        uri: "one",
        childUri: "two/three",
        route: routes[0],
      },
      {
        params: {},
        uri: "two",
        childUri: "three",
        route: routes[0].routes[0],
      },
      {
        params: {},
        uri: "three",
        childUri: null,
        route: routes[0].routes[0].routes[0],
      },
    ]);
  });
});

describe("preloadMatches", () => {
  test("promise resolves when all route.preload functions resolve", async () => {
    const routes = [
      {
        path: "/one/*",
        preload: () => Promise.resolve(),
        routes: [
          {
            path: "/two/*",
            preload: () => Promise.resolve(),
            routes: [
              {
                path: "/three",
                preload: () => Promise.resolve(),
              },
            ],
          },
        ],
      },
    ];

    const matches = matchRoutes(routes, "/one/two/three");
    expect(matches).toHaveLength(3);
    const promise = preloadMatches(matches, {});

    await expect(promise).resolves.toBe(undefined);
  });

  test("promise rejects when one route.preload function rejects", async () => {
    const routes = [
      {
        path: "/one/*",
        preload: () => Promise.resolve(),
        routes: [
          {
            path: "/two/*",
            preload: () => Promise.reject(new Error("failure")),
            routes: [
              {
                path: "/three",
                preload: () => Promise.resolve(),
              },
            ],
          },
        ],
      },
    ];

    const matches = matchRoutes(routes, "/one/two/three");
    expect(matches).toHaveLength(3);
    const promise = preloadMatches(matches, {});

    await expect(promise).rejects.toThrow("failure");
  });

  test("all present route.preload functions are called", async () => {
    const preloadOne = jest.fn(() => Promise.resolve());
    const preloadThree = jest.fn(() => Promise.resolve());
    const routes = [
      {
        path: "/one/*",
        preload: preloadOne,
        routes: [
          {
            path: "/two/*",
            routes: [
              {
                path: "/three",
                preload: preloadThree,
              },
            ],
          },
        ],
      },
    ];

    const matches = matchRoutes(routes, "/one/two/three");
    expect(matches).toHaveLength(3);
    await preloadMatches(matches, {});

    expect(preloadOne).toHaveBeenCalledTimes(1);
    expect(preloadThree).toHaveBeenCalledTimes(1);
  });

  test("route.preload functions are called with params and extra props", async () => {
    const preload = jest.fn(() => Promise.resolve());
    const routes = [{ path: "/:param", preload }];

    const matches = matchRoutes(routes, "/one");
    expect(matches).toHaveLength(1);
    await preloadMatches(matches, { extra: "prop" });

    expect(preload).toHaveBeenCalledWith({
      params: { param: "one" },
      extra: "prop",
    });
  });
});
