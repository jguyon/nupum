import React from "react";
import invariant from "tiny-invariant";
import { render, act } from "../test/react";
import {
  RESOURCE_PENDING,
  RESOURCE_SUCCESS,
  RESOURCE_FAILURE,
} from "./constants";
import createResource from "./create-resource";
import useResource, { ResourceCacheProvider } from "./use-resource";
import createTestResourceCache from "./create-test-resource-cache";

function fetch() {
  invariant(false, "resource fetch function should not be called");
}

function AsyncResource({ resource, input }) {
  const result = useResource(resource, input);

  switch (result.status) {
    case RESOURCE_PENDING:
      return <>pending</>;
    case RESOURCE_SUCCESS:
      return <>success: {result.data}</>;
    case RESOURCE_FAILURE:
      return <>failure: {result.error}</>;
    default:
      invariant(false, `invalid status ${result.status}`);
  }
}

test("pending result is rendered when requested resource is not in cache", () => {
  const resource = createResource(fetch);
  const cache = createTestResourceCache();

  const { container } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");
});

test("pending result is rendered when requested resource is currently pending", () => {
  const resource = createResource(fetch);
  const cache = createTestResourceCache();

  const { container, rerender } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource key="one" resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");

  rerender(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource key="two" resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");
});

test("successful result is rendered when requested resource is succeeded", () => {
  const resource = createResource(fetch);
  const cache = createTestResourceCache();

  const { container } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  act(() => {
    cache.succeed(resource, "input", "resource data");
  });

  expect(container).toHaveTextContent("success: resource data");
});

test("successful result is rendered when requested resource has previously been succeeded", () => {
  const resource = createResource(fetch);
  const cache = createTestResourceCache();

  const { container, rerender } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource key="one" resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  act(() => {
    cache.succeed(resource, "input", "resource data");
  });

  rerender(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource key="two" resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("success: resource data");
});

test("failed result is rendered when requested resource is failed", () => {
  const resource = createResource(fetch);
  const cache = createTestResourceCache();

  const { container } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  act(() => {
    cache.fail(resource, "input", "resource error");
  });

  expect(container).toHaveTextContent("failure: resource error");
});

test("failed result is rendered when requested resource has previously been failed", () => {
  const resource = createResource(fetch);
  const cache = createTestResourceCache();

  const { container, rerender } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource key="one" resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  act(() => {
    cache.fail(resource, "input", "resource error");
  });

  rerender(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource key="two" resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("failure: resource error");
});

test("result is rerendered when new input is requested", () => {
  const resource = createResource(fetch);
  const cache = createTestResourceCache();

  const { container, rerender } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input="one" />
    </ResourceCacheProvider>,
  );

  act(() => {
    cache.succeed(resource, "one", "resource data one");
  });

  expect(container).toHaveTextContent("success: resource data one");

  rerender(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input="two" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");

  act(() => {
    cache.succeed(resource, "two", "resource data two");
  });

  expect(container).toHaveTextContent("success: resource data two");
});

test("result is rerendered when new resource is requested", () => {
  const resourceOne = createResource(fetch);
  const resourceTwo = createResource(fetch);
  const cache = createTestResourceCache();

  const { container, rerender } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resourceOne} input="input" />
    </ResourceCacheProvider>,
  );

  act(() => {
    cache.succeed(resourceOne, "input", "resource data one");
  });

  expect(container).toHaveTextContent("success: resource data one");

  rerender(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resourceTwo} input="input" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");

  act(() => {
    cache.succeed(resourceTwo, "input", "resource data two");
  });

  expect(container).toHaveTextContent("success: resource data two");
});

test("result is rerendered when new cache is provided", () => {
  const resource = createResource(fetch);
  const cacheOne = createTestResourceCache();
  const cacheTwo = createTestResourceCache();

  const { container, rerender } = render(
    <ResourceCacheProvider cache={cacheOne}>
      <AsyncResource resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  act(() => {
    cacheOne.succeed(resource, "input", "resource data one");
  });

  expect(container).toHaveTextContent("success: resource data one");

  rerender(
    <ResourceCacheProvider cache={cacheTwo}>
      <AsyncResource resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");

  act(() => {
    cacheTwo.succeed(resource, "input", "resource data two");
  });

  expect(container).toHaveTextContent("success: resource data two");
});

test("previous fetching is canceled when refetching", () => {
  const resource = createResource(fetch);
  const cache = createTestResourceCache();

  const { container, rerender } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input="one" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");

  rerender(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input="two" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");

  act(() => {
    cache.succeed(resource, "one", "resource data one");
  });

  expect(container).toHaveTextContent("pending");

  act(() => {
    cache.succeed(resource, "two", "resource data two");
  });

  expect(container).toHaveTextContent("success: resource data two");
});

test("input is hashed with provided hash function", () => {
  const resource = createResource(fetch, ({ text }) => text);
  const cache = createTestResourceCache();

  const { container, rerender } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource
        resource={resource}
        input={{ text: "text", other: "one" }}
      />
    </ResourceCacheProvider>,
  );

  act(() => {
    cache.succeed(resource, { text: "text" }, "resource data text");
  });

  expect(container).toHaveTextContent("success: resource data text");

  rerender(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource
        resource={resource}
        input={{ text: "text", other: "two" }}
      />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("success: resource data text");
});

test("successful result is rendered when requested resource has been succeeded during preloading", async () => {
  const resource = createResource(fetch);
  const cache = createTestResourceCache();

  const promise = cache.preload(resource, "input");
  cache.succeed(resource, "input", "resource data");
  const result = await promise;

  const { container } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("success: resource data");
  expect(result).toEqual({
    status: RESOURCE_SUCCESS,
    data: "resource data",
  });
});

test("failed result is rendered when requested resource has been failed during preloading", async () => {
  const resource = createResource(fetch);
  const cache = createTestResourceCache();

  const promise = cache.preload(resource, "input");
  cache.fail(resource, "input", "resource error");
  const result = await promise;

  const { container } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("failure: resource error");
  expect(result).toEqual({
    status: RESOURCE_FAILURE,
    error: "resource error",
  });
});
