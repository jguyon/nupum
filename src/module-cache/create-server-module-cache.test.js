import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import invariant from "tiny-invariant";
import { MODULE_PENDING, MODULE_SUCCESS, MODULE_FAILURE } from "./constants";
import createModule from "./create-module";
import useModule, { ModuleCacheProvider } from "./use-module";
import createServerModuleCache from "./create-server-module-cache";

function AsyncModule({ module }) {
  const result = useModule(module);

  switch (result.status) {
    case MODULE_PENDING:
      return <>pending</>;
    case MODULE_SUCCESS:
      return <>success: {result.module}</>;
    case MODULE_FAILURE:
      return <>failure: {result.error}</>;
    default:
      invariant(false, `invalid status ${result.status}`);
  }
}

test("pending result is rendered when requested module has not been preloaded", () => {
  const fetch = jest.fn(() => Promise.resolve());
  const module = createModule(fetch, "module-name");
  const cache = createServerModuleCache();

  const result = renderToStaticMarkup(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  expect(result).toBe("pending");
  expect(fetch).not.toHaveBeenCalled();
});

test("pending result is rendered when requested module is currently preloading", () => {
  const fetch = jest.fn(() => Promise.resolve());
  const module = createModule(fetch, "module-name");
  const cache = createServerModuleCache();

  cache.preload(module);

  const result = renderToStaticMarkup(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  expect(result).toBe("pending");
  expect(fetch).toHaveBeenCalledTimes(1);
});

test("successful result is rendered when requested module has successfully been preloaded", async () => {
  const module = createModule(
    () => Promise.resolve("module data"),
    "module-name",
  );
  const cache = createServerModuleCache();

  const preloadResult = await cache.preload(module);

  const renderResult = renderToStaticMarkup(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  expect(renderResult).toBe("success: module data");
  expect(preloadResult).toEqual({
    status: MODULE_SUCCESS,
    module: "module data",
  });
});

test("failed result is rendered when requested module has unsuccessfully been preloaded", async () => {
  const module = createModule(
    () => Promise.reject("module error"),
    "module-name",
  );
  const cache = createServerModuleCache();

  const preloadResult = await cache.preload(module);

  const renderResult = renderToStaticMarkup(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  expect(renderResult).toBe("failure: module error");
  expect(preloadResult).toEqual({
    status: MODULE_FAILURE,
    error: "module error",
  });
});

test("pending result is rendered when requested module is null", () => {
  const cache = createServerModuleCache();

  const renderResult = renderToStaticMarkup(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={null} />
    </ModuleCacheProvider>,
  );

  expect(renderResult).toBe("pending");
});

test("preloading a module multiple times does not refetch it", async () => {
  const fetch = jest.fn(() => Promise.resolve("module data"));
  const module = createModule(fetch, "module-name");
  const cache = createServerModuleCache();

  const promisedResultOne = cache.preload(module);
  expect(fetch).toHaveBeenCalledTimes(1);
  const resultTwo = await cache.preload(module);
  expect(fetch).toHaveBeenCalledTimes(1);
  const resultThree = await cache.preload(module);
  expect(fetch).toHaveBeenCalledTimes(1);
  const resultOne = await promisedResultOne;
  expect(resultTwo).toBe(resultOne);
  expect(resultThree).toBe(resultOne);
});

test("preloading modules saves chunk names", async () => {
  const moduleOne = createModule(() => Promise.resolve(), "module-one");
  const moduleTwo = createModule(() => Promise.resolve(), "module-two");
  const cache = createServerModuleCache();

  await Promise.all([cache.preload(moduleOne), cache.preload(moduleTwo)]);
  expect(cache.chunks()).toEqual(["module-one", "module-two"]);
});
