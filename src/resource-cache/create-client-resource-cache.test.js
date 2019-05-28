import React from "react";
import invariant from "tiny-invariant";
import { render, wait } from "../test/react";
import {
  RESOURCE_PENDING,
  RESOURCE_SUCCESS,
  RESOURCE_FAILURE,
} from "./constants";
import createResource from "./create-resource";
import createClientResourceCache from "./create-client-resource-cache";
import useResource, { ResourceCacheProvider } from "./use-resource";

jest.useFakeTimers();

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const dateNow = jest.spyOn(Date, "now");

afterEach(() => {
  dateNow.mockReset();
});

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
  const fetch = jest.fn(() => Promise.resolve());
  const resource = createResource(fetch);
  const cache = createClientResourceCache();

  const { container } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith("input");
});

test("pending result is rendered when requested resource is currently fetching", () => {
  const fetch = jest.fn(() => Promise.resolve());
  const resource = createResource(fetch);
  const cache = createClientResourceCache();

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
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith("input");
});

test("successful result is rendered when fetching of requested resource resolves", async () => {
  const resource = createResource(() => Promise.resolve("resource data"));
  const cache = createClientResourceCache();

  const { container } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  await wait(() => {
    expect(container).toHaveTextContent("success: resource data");
  });
});

test("successful result is rendered when fetching of requested resource has previously resolved", async () => {
  const resource = createResource(() => Promise.resolve("resource data"));
  const cache = createClientResourceCache();

  const { container, rerender } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource key="one" resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  await wait(() => {
    expect(container).toHaveTextContent("success: resource data");
  });

  rerender(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource key="two" resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("success: resource data");
});

test("failed result is rendered when fetching of requested resource rejects", async () => {
  const resource = createResource(() => Promise.reject("resource error"));
  const cache = createClientResourceCache();

  const { container } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  await wait(() => {
    expect(container).toHaveTextContent("failure: resource error");
  });
});

test("failed result is rendered when fetching of requested resource has previously rejected", async () => {
  const resource = createResource(() => Promise.reject("resource error"));
  const cache = createClientResourceCache();

  const { container, rerender } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource key="one" resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  await wait(() => {
    expect(container).toHaveTextContent("failure: resource error");
  });

  rerender(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource key="two" resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("failure: resource error");
});

test("pending result is rendered when requested resource is null", () => {
  const cache = createClientResourceCache();

  const { container } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={null} input="input" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");
});

test("result is rerendered when new input is requested", async () => {
  const resource = createResource(input =>
    Promise.resolve(`resource data ${input}`),
  );
  const cache = createClientResourceCache();

  const { container, rerender } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input="one" />
    </ResourceCacheProvider>,
  );

  await wait(() => {
    expect(container).toHaveTextContent("success: resource data one");
  });

  rerender(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input="two" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");
  await wait(() => {
    expect(container).toHaveTextContent("success: resource data two");
  });
});

test("result is rerendered when new resource is requested", async () => {
  const resourceOne = createResource(() =>
    Promise.resolve("resource data one"),
  );
  const resourceTwo = createResource(() =>
    Promise.resolve("resource data two"),
  );
  const cache = createClientResourceCache();

  const { container, rerender } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resourceOne} input="input" />
    </ResourceCacheProvider>,
  );

  await wait(() => {
    expect(container).toHaveTextContent("success: resource data one");
  });

  rerender(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resourceTwo} input="input" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");
  await wait(() => {
    expect(container).toHaveTextContent("success: resource data two");
  });
});

test("result is rerendered when new cache is provided", async () => {
  const resource = createResource(() => Promise.resolve("resource data"));
  const cacheOne = createClientResourceCache();
  const cacheTwo = createClientResourceCache();

  const { container, rerender } = render(
    <ResourceCacheProvider cache={cacheOne}>
      <AsyncResource resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  await wait(() => {
    expect(container).toHaveTextContent("success: resource data");
  });

  rerender(
    <ResourceCacheProvider cache={cacheTwo}>
      <AsyncResource resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");
  await wait(() => {
    expect(container).toHaveTextContent("success: resource data");
  });
});

test("previous fetching is canceled when refetching", async () => {
  const resource = createResource(ms =>
    delay(ms).then(() => `resource data ${ms}`),
  );
  const cache = createClientResourceCache();

  const { container, rerender } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input={200} />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");

  rerender(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input={100} />
    </ResourceCacheProvider>,
  );

  jest.advanceTimersByTime(200);
  await wait(() => {
    expect(container).toHaveTextContent("success: resource data 100");
  });
});

test("input is hashed with provided hash function", async () => {
  const resource = createResource(
    ({ text }) => Promise.resolve(`resource data ${text}`),
    ({ text }) => text,
  );
  const cache = createClientResourceCache();

  const { container, rerender } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource
        resource={resource}
        input={{ text: "text", other: "one" }}
      />
    </ResourceCacheProvider>,
  );

  await wait(() => {
    expect(container).toHaveTextContent("success: resource data text");
  });

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

test("least recently used items are evicted", async () => {
  const resource = createResource(input =>
    Promise.resolve(`resource data ${input}`),
  );
  const cache = createClientResourceCache({
    maxSize: 3,
  });

  const { container, rerender } = render(
    <ResourceCacheProvider key="one" cache={cache}>
      <AsyncResource resource={resource} input="one" />
      {" | "}
      <AsyncResource resource={resource} input="two" />
      {" | "}
      <AsyncResource resource={resource} input="three" />
    </ResourceCacheProvider>,
  );

  await wait(() => {
    expect(container).toHaveTextContent(
      "success: resource data one | " +
        "success: resource data two | " +
        "success: resource data three",
    );
  });

  rerender(
    <ResourceCacheProvider key="two" cache={cache}>
      <AsyncResource resource={resource} input="one" />
      {" | "}
      <AsyncResource resource={resource} input="four" />
      {" | "}
      <AsyncResource resource={resource} input="five" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent(
    "success: resource data one | pending | pending",
  );
  await wait(() => {
    expect(container).toHaveTextContent(
      "success: resource data one | " +
        "success: resource data four | " +
        "success: resource data five",
    );
  });

  rerender(
    <ResourceCacheProvider key="three" cache={cache}>
      <AsyncResource resource={resource} input="one" />
      {" | "}
      <AsyncResource resource={resource} input="two" />
      {" | "}
      <AsyncResource resource={resource} input="three" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent(
    "success: resource data one | pending | pending",
  );
  await wait(() => {
    expect(container).toHaveTextContent(
      "success: resource data one | " +
        "success: resource data two | " +
        "success: resource data three",
    );
  });
});

test("old items are evicted", async () => {
  const resource = createResource(() => Promise.resolve("resource data"));
  const cache = createClientResourceCache({ maxAge: 50 });

  dateNow.mockImplementation(() => 1000);
  const { container, rerender } = render(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource key="one" resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  await wait(() => {
    expect(container).toHaveTextContent("success: resource data");
  });

  dateNow.mockImplementation(() => 1050);
  rerender(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource key="two" resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("success: resource data");

  dateNow.mockImplementation(() => 1101);
  rerender(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource key="three" resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent("pending");
  await wait(() => {
    expect(container).toHaveTextContent("success: resource data");
  });
});

test("successful result is rendered when requested resource has successfully been preloaded", async () => {
  const resource = createResource(() => Promise.resolve("resource data"));
  const cache = createClientResourceCache();

  const result = await cache.preload(resource, "input");

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

test("failed result is rendered when requested resource has unsuccessfully been preloaded", async () => {
  const resource = createResource(() => Promise.reject("resource error"));
  const cache = createClientResourceCache();

  const result = await cache.preload(resource, "input");

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

test("preloading a resource multiple times does not refetch it", async () => {
  const fetch = jest.fn(() => Promise.resolve("resource data"));
  const resource = createResource(fetch);
  const cache = createClientResourceCache();

  const promisedResultOne = cache.preload(resource, "input");
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith("input");
  const resultTwo = await cache.preload(resource, "input");
  expect(fetch).toHaveBeenCalledTimes(1);
  const resultThree = await cache.preload(resource, "input");
  expect(fetch).toHaveBeenCalledTimes(1);
  const resultOne = await promisedResultOne;
  expect(resultTwo).toBe(resultOne);
  expect(resultThree).toBe(resultOne);
});
