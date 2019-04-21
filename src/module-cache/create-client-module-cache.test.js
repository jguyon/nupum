import React from "react";
import invariant from "tiny-invariant";
import { render, wait } from "../test/react";
import { MODULE_PENDING, MODULE_SUCCESS, MODULE_FAILURE } from "./constants";
import createModule from "./create-module";
import useModule, { ModuleCacheProvider } from "./use-module";
import createClientModuleCache from "./create-client-module-cache";

jest.useFakeTimers();

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

// stub console.error until `act(...)` warnings can be fixed
// https://github.com/facebook/react/issues/14769
const consoleError = jest.spyOn(console, "error");
consoleError.mockImplementation(() => {});

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

test("pending result is rendered when requested module is not in cache", () => {
  const fetch = jest.fn(() => Promise.resolve());
  const module = createModule(fetch);
  const cache = createClientModuleCache();

  const { container } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");
  expect(fetch).toHaveBeenCalledTimes(1);
});

test("pending result is rendered when requested module is currently fetching", () => {
  const fetch = jest.fn(() => Promise.resolve());
  const module = createModule(fetch);
  const cache = createClientModuleCache();

  const { container, rerender } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule key="one" module={module} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");

  rerender(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule key="two" module={module} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");
  expect(fetch).toHaveBeenCalledTimes(1);
});

test("successful result is rendered when fetching of requested module resolves", async () => {
  const module = createModule(() => Promise.resolve("module data"));
  const cache = createClientModuleCache();

  const { container } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  await wait(() => {
    expect(container).toHaveTextContent("success: module data");
  });
});

test("successful result is rendered when fetching of requested module has previously resolved", async () => {
  const module = createModule(() => Promise.resolve("module data"));
  const cache = createClientModuleCache();

  const { container, rerender } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule key="one" module={module} />
    </ModuleCacheProvider>,
  );

  await wait(() => {
    expect(container).toHaveTextContent("success: module data");
  });

  rerender(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule key="two" module={module} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent("success: module data");
});

test("failed result is rendered when fetching of requested module rejects", async () => {
  const module = createModule(() => Promise.reject("module error"));
  const cache = createClientModuleCache();

  const { container } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  await wait(() => {
    expect(container).toHaveTextContent("failure: module error");
  });
});

test("failed result is rendered when fetching of requested module has previously rejected", async () => {
  const module = createModule(() => Promise.reject("module error"));
  const cache = createClientModuleCache();

  const { container, rerender } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule key="one" module={module} />
    </ModuleCacheProvider>,
  );

  await wait(() => {
    expect(container).toHaveTextContent("failure: module error");
  });

  rerender(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule key="two" module={module} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent("failure: module error");
});

test("result is rerendered when new module is requested", async () => {
  const moduleOne = createModule(() => Promise.resolve("module one"));
  const moduleTwo = createModule(() => Promise.resolve("module two"));
  const cache = createClientModuleCache();

  const { container, rerender } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={moduleOne} />
    </ModuleCacheProvider>,
  );

  await wait(() => {
    expect(container).toHaveTextContent("success: module one");
  });

  rerender(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={moduleTwo} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");
  await wait(() => {
    expect(container).toHaveTextContent("success: module two");
  });
});

test("result is rerendered when new cache is provided", async () => {
  const module = createModule(() => Promise.resolve("module data"));
  const cacheOne = createClientModuleCache();
  const cacheTwo = createClientModuleCache();

  const { container, rerender } = render(
    <ModuleCacheProvider cache={cacheOne}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  await wait(() => {
    expect(container).toHaveTextContent("success: module data");
  });

  rerender(
    <ModuleCacheProvider cache={cacheTwo}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");
  await wait(() => {
    expect(container).toHaveTextContent("success: module data");
  });
});

test("previous fetching is canceled when refetching", async () => {
  const moduleOne = createModule(() => delay(200).then(() => "module one"));
  const moduleTwo = createModule(() => delay(100).then(() => "module two"));
  const cache = createClientModuleCache();

  const { container, rerender } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={moduleOne} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");

  rerender(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={moduleTwo} />
    </ModuleCacheProvider>,
  );

  jest.advanceTimersByTime(200);
  await wait(() => {
    expect(container).toHaveTextContent("success: module two");
  });
});

test("successful result is rendered when requested module has successfully been preloaded", async () => {
  const module = createModule(() => Promise.resolve("module data"));
  const cache = createClientModuleCache();

  await cache.preload(module);

  const { container } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent("success: module data");
});

test("failed result is rendered when requested module has unsuccessfully been preloaded", async () => {
  const module = createModule(() => Promise.reject("module error"));
  const cache = createClientModuleCache();

  await cache.preload(module);

  const { container } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent("failure: module error");
});

test("preloading a module multiple times does not refetch it", async () => {
  const fetch = jest.fn(() => Promise.resolve());
  const module = createModule(fetch);
  const cache = createClientModuleCache();

  cache.preload(module);
  expect(fetch).toHaveBeenCalledTimes(1);
  await cache.preload(module);
  expect(fetch).toHaveBeenCalledTimes(1);
});
