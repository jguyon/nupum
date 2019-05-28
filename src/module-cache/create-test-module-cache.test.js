import React from "react";
import invariant from "tiny-invariant";
import { render, act } from "../test/react";
import { MODULE_PENDING, MODULE_SUCCESS, MODULE_FAILURE } from "./constants";
import createModule from "./create-module";
import useModule, { ModuleCacheProvider } from "./use-module";
import createTestModuleCache from "./create-test-module-cache";

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
  const cache = createTestModuleCache();

  const { container } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");
  expect(fetch).not.toHaveBeenCalled();
});

test("pending result is rendered when requested module is currently pending", () => {
  const fetch = jest.fn(() => Promise.resolve());
  const module = createModule(fetch);
  const cache = createTestModuleCache();

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
  expect(fetch).not.toHaveBeenCalled();
});

test("successful result is rendered when waiting on requested module succeeds", async () => {
  const fetch = jest.fn(() => Promise.resolve("module data"));
  const module = createModule(fetch);
  const cache = createTestModuleCache();

  const { container } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  await act(async () => {
    await expect(cache.wait(module)).resolves.toBe(undefined);
  });

  expect(container).toHaveTextContent("success: module data");
  expect(fetch).toHaveBeenCalledTimes(1);
});

test("successful result is rendered when waiting on requested module has previously succeeded", async () => {
  const fetch = jest.fn(() => Promise.resolve("module data"));
  const module = createModule(fetch);
  const cache = createTestModuleCache();

  const { container, rerender } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule key="one" module={module} />
    </ModuleCacheProvider>,
  );

  await act(async () => {
    await expect(cache.wait(module)).resolves.toBe(undefined);
  });

  rerender(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule key="two" module={module} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent("success: module data");
  expect(fetch).toHaveBeenCalledTimes(1);
});

test("result is not rerendered when waiting on requested module fails", async () => {
  const fetch = jest.fn(() => Promise.reject("module error"));
  const module = createModule(fetch);
  const cache = createTestModuleCache();

  const { container } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  await act(async () => {
    await expect(cache.wait(module)).rejects.toBe("module error");
  });

  expect(container).toHaveTextContent("pending");
  expect(fetch).toHaveBeenCalledTimes(1);
});

test("successful results are rendered when waiting on all requested modules succeeds", async () => {
  const moduleOne = createModule(() => Promise.resolve("module data one"));
  const moduleTwo = createModule(() => Promise.resolve("module data two"));
  const moduleThree = createModule(() => Promise.resolve("module data three"));
  const cache = createTestModuleCache();

  const { container } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={moduleOne} />
      {" | "}
      <AsyncModule module={moduleTwo} />
      {" | "}
      <AsyncModule module={moduleThree} />
    </ModuleCacheProvider>,
  );

  await act(async () => {
    await expect(cache.waitAll()).resolves.toBe(undefined);
  });

  expect(container).toHaveTextContent(
    "success: module data one | " +
      "success: module data two | " +
      "success: module data three",
  );
});

test("successful results are rendered when waiting on all requested modules has previously succeeded", async () => {
  const moduleOne = createModule(() => Promise.resolve("module data one"));
  const moduleTwo = createModule(() => Promise.resolve("module data two"));
  const moduleThree = createModule(() => Promise.resolve("module data three"));
  const cache = createTestModuleCache();

  const { container, rerender } = render(
    <ModuleCacheProvider key="one" cache={cache}>
      <AsyncModule module={moduleOne} />
      {" | "}
      <AsyncModule module={moduleTwo} />
      {" | "}
      <AsyncModule module={moduleThree} />
    </ModuleCacheProvider>,
  );

  await act(async () => {
    await expect(cache.waitAll()).resolves.toBe(undefined);
  });

  rerender(
    <ModuleCacheProvider key="two" cache={cache}>
      <AsyncModule module={moduleOne} />
      {" | "}
      <AsyncModule module={moduleTwo} />
      {" | "}
      <AsyncModule module={moduleThree} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent(
    "success: module data one | " +
      "success: module data two | " +
      "success: module data three",
  );
});

test("failed results are not rerendered when waiting on all requested modules fails", async () => {
  const moduleOne = createModule(() => Promise.resolve("module data one"));
  const moduleTwo = createModule(() => Promise.reject("module error two"));
  const moduleThree = createModule(() => Promise.resolve("module data three"));
  const cache = createTestModuleCache();

  const { container } = render(
    <ModuleCacheProvider key="one" cache={cache}>
      <AsyncModule module={moduleOne} />
      {" | "}
      <AsyncModule module={moduleTwo} />
      {" | "}
      <AsyncModule module={moduleThree} />
    </ModuleCacheProvider>,
  );

  await act(async () => {
    await expect(cache.waitAll()).rejects.toBe("module error two");
  });

  expect(container).toHaveTextContent(
    "success: module data one | pending | success: module data three",
  );
});

test("failed result is rendered when requested module is failed", () => {
  const module = createModule(() => Promise.resolve());
  const cache = createTestModuleCache();

  const { container } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  act(() => {
    cache.fail(module, "module error");
  });

  expect(container).toHaveTextContent("failure: module error");
});

test("failed result is rendered when requested module has previously been failed", () => {
  const module = createModule(() => Promise.resolve());
  const cache = createTestModuleCache();

  const { container, rerender } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule key="one" module={module} />
    </ModuleCacheProvider>,
  );

  act(() => {
    cache.fail(module, "module error");
  });

  rerender(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule key="two" module={module} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent("failure: module error");
});

test("pending result is rendered when requested module is null", () => {
  const cache = createTestModuleCache();

  const { container } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={null} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");
});

test("result is rerendered when new module is requested", async () => {
  const moduleOne = createModule(() => Promise.resolve("module data one"));
  const moduleTwo = createModule(() => Promise.resolve("module data two"));
  const cache = createTestModuleCache();

  const { container, rerender } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={moduleOne} />
    </ModuleCacheProvider>,
  );

  await act(async () => {
    await cache.wait(moduleOne);
  });
  expect(container).toHaveTextContent("success: module data one");

  rerender(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={moduleTwo} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");
  await act(async () => {
    await cache.wait(moduleTwo);
  });
  expect(container).toHaveTextContent("success: module data two");
});

test("result is rerendered when new cache is provided", async () => {
  const module = createModule(() => Promise.resolve("module data"));
  const cacheOne = createTestModuleCache();
  const cacheTwo = createTestModuleCache();

  const { container, rerender } = render(
    <ModuleCacheProvider cache={cacheOne}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  await act(async () => {
    await cacheOne.wait(module);
  });
  expect(container).toHaveTextContent("success: module data");

  rerender(
    <ModuleCacheProvider cache={cacheTwo}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");
  await act(async () => {
    await cacheTwo.wait(module);
  });
  expect(container).toHaveTextContent("success: module data");
});

test("previous fetching is canceled when refetching", async () => {
  const moduleOne = createModule(() => Promise.resolve("module data one"));
  const moduleTwo = createModule(() => Promise.resolve("module data two"));
  const cache = createTestModuleCache();

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

  await act(async () => {
    await cache.wait(moduleOne);
  });
  expect(container).toHaveTextContent("pending");

  await act(async () => {
    await cache.wait(moduleTwo);
  });
  expect(container).toHaveTextContent("success: module data two");
});

test("successful result is rendered when waiting on requested module has succeeded during preloading", async () => {
  const module = createModule(() => Promise.resolve("module data"));
  const cache = createTestModuleCache();

  const promise = cache.preload(module);
  await cache.wait(module);
  const result = await promise;

  const { container } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent("success: module data");
  expect(result).toEqual({
    status: MODULE_SUCCESS,
    module: "module data",
  });
});

test("failed result is rendered when requested module has been failed during preloading", async () => {
  const module = createModule(() => Promise.resolve());
  const cache = createTestModuleCache();

  const promise = cache.preload(module);
  cache.fail(module, "module error");
  const result = await promise;

  const { container } = render(
    <ModuleCacheProvider cache={cache}>
      <AsyncModule module={module} />
    </ModuleCacheProvider>,
  );

  expect(container).toHaveTextContent("failure: module error");
  expect(result).toEqual({
    status: MODULE_FAILURE,
    error: "module error",
  });
});

test("preloading a module multiple times works", async () => {
  const module = createModule(() => Promise.resolve("module data"));
  const cache = createTestModuleCache();

  const promisedResultOne = cache.preload(module);
  const promisedResultTwo = cache.preload(module);
  await cache.wait(module);
  const resultOne = await promisedResultOne;
  const resultTwo = await promisedResultTwo;
  const resultThree = await cache.preload(module);

  expect(resultTwo).toBe(resultOne);
  expect(resultThree).toBe(resultOne);
});
