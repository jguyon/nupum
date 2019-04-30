import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import invariant from "tiny-invariant";
import { render } from "../test/react";
import {
  RESOURCE_PENDING,
  RESOURCE_SUCCESS,
  RESOURCE_FAILURE,
  SERIALIZED_SUCCESS,
  SERIALIZED_FAILURE,
} from "./constants";
import createResource from "./create-resource";
import createServerResourceCache from "./create-server-resource-cache";
import createClientResourceCache from "./create-client-resource-cache";
import useResource, { ResourceCacheProvider } from "./use-resource";

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

test("pending result is rendered when requested resource has not been preloaded", () => {
  const fetch = jest.fn(() => Promise.resolve());
  const resource = createResource(fetch);
  const cache = createServerResourceCache({ resource });

  const result = renderToStaticMarkup(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  expect(result).toBe("pending");
  expect(fetch).not.toHaveBeenCalled();
});

test("pending result is rendered when requested resource is currently preloading", () => {
  const fetch = jest.fn(() => Promise.resolve());
  const resource = createResource(fetch);
  const cache = createServerResourceCache({ resource });

  cache.preload(resource, "input");

  const result = renderToStaticMarkup(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  expect(result).toBe("pending");
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith("input");
});

test("successful result is rendered when requested resource has successfully been preloaded", async () => {
  const resource = createResource(() => Promise.resolve("resource data"));
  const cache = createServerResourceCache({ resource });

  const preloadResult = await cache.preload(resource, "input");

  const renderResult = renderToStaticMarkup(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  expect(renderResult).toBe("success: resource data");
  expect(preloadResult).toEqual({
    status: RESOURCE_SUCCESS,
    data: "resource data",
  });
});

test("failed result is rendered when requested resource has unsuccessfully been preloaded", async () => {
  const resource = createResource(() => Promise.reject("resource error"));
  const cache = createServerResourceCache({ resource });

  const preloadResult = await cache.preload(resource, "input");

  const renderResult = renderToStaticMarkup(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={resource} input="input" />
    </ResourceCacheProvider>,
  );

  expect(renderResult).toBe("failure: resource error");
  expect(preloadResult).toEqual({
    status: RESOURCE_FAILURE,
    error: "resource error",
  });
});

test("pending result is rendered when requested resource is null", () => {
  const cache = createServerResourceCache({});

  const renderResult = renderToStaticMarkup(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource resource={null} input="input" />
    </ResourceCacheProvider>,
  );

  expect(renderResult).toBe("pending");
});

test("preloading a resource multiple times does not refetch it", async () => {
  const fetch = jest.fn(() => Promise.resolve());
  const resource = createResource(fetch);
  const cache = createServerResourceCache({ resource });

  cache.preload(resource, "input");
  expect(fetch).toHaveBeenCalledTimes(1);
  await cache.preload(resource, "input");
  expect(fetch).toHaveBeenCalledTimes(1);
  await cache.preload(resource, "input");
  expect(fetch).toHaveBeenCalledTimes(1);
});

test("input is hashed with provided hash function", async () => {
  const resource = createResource(
    ({ text }) => Promise.resolve(`resource data ${text}`),
    ({ text }) => text,
  );
  const cache = createServerResourceCache({ resource });

  await cache.preload(resource, { text: "text" });

  const resultOne = renderToStaticMarkup(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource
        resource={resource}
        input={{ text: "text", other: "one" }}
      />
    </ResourceCacheProvider>,
  );

  expect(resultOne).toBe("success: resource data text");

  const resultTwo = renderToStaticMarkup(
    <ResourceCacheProvider cache={cache}>
      <AsyncResource
        resource={resource}
        input={{ text: "text", other: "two" }}
      />
    </ResourceCacheProvider>,
  );

  expect(resultTwo).toBe("success: resource data text");
});

test("serializing saves successfully preloaded resources", async () => {
  const resourceOne = createResource(input =>
    Promise.resolve(`resource one data ${input}`),
  );
  const resourceTwo = createResource(
    ({ text }) => Promise.resolve(`resource two data ${text}`),
    ({ text }) => text,
  );
  const cache = createServerResourceCache({
    resourceOne,
    resourceTwo,
  });

  await Promise.all([
    cache.preload(resourceOne, "one"),
    cache.preload(resourceTwo, { text: "two" }),
    cache.preload(resourceOne, "three"),
    cache.preload(resourceTwo, { text: "four" }),
  ]);

  expect(cache.serialize()).toEqual({
    resourceOne: [
      ["one", SERIALIZED_SUCCESS, "resource one data one"],
      ["three", SERIALIZED_SUCCESS, "resource one data three"],
    ],
    resourceTwo: [
      ["two", SERIALIZED_SUCCESS, "resource two data two"],
      ["four", SERIALIZED_SUCCESS, "resource two data four"],
    ],
  });
});

test("serializing saves unsuccessfully preloaded resources", async () => {
  const resourceOne = createResource(input =>
    Promise.reject(`resource one error ${input}`),
  );
  const resourceTwo = createResource(
    ({ text }) => Promise.reject(`resource two error ${text}`),
    ({ text }) => text,
  );
  const cache = createServerResourceCache({
    resourceOne,
    resourceTwo,
  });

  await Promise.all([
    cache.preload(resourceOne, "one"),
    cache.preload(resourceTwo, { text: "two" }),
    cache.preload(resourceOne, "three"),
    cache.preload(resourceTwo, { text: "four" }),
  ]);

  expect(cache.serialize()).toEqual({
    resourceOne: [
      ["one", SERIALIZED_FAILURE, "resource one error one"],
      ["three", SERIALIZED_FAILURE, "resource one error three"],
    ],
    resourceTwo: [
      ["two", SERIALIZED_FAILURE, "resource two error two"],
      ["four", SERIALIZED_FAILURE, "resource two error four"],
    ],
  });
});

test("serializing does not save pending resources", () => {
  const resource = createResource(input => Promise.resolve());
  const cache = createServerResourceCache({ resource });

  cache.preload(resource, "one");
  cache.preload(resource, "two");
  cache.preload(resource, "three");
  cache.preload(resource, "four");

  expect(cache.serialize()).toEqual({});
});

test("client cache can be populated with serialized data", async () => {
  const resourceOne = createResource(input =>
    input === "success"
      ? Promise.resolve("resource one data")
      : Promise.reject("resource one error"),
  );
  const resourceTwo = createResource(
    ({ status }) =>
      status === "success"
        ? Promise.resolve("resource two data")
        : Promise.reject("resource two error"),
    ({ status }) => status,
  );
  const serverCache = createServerResourceCache({ resourceOne, resourceTwo });
  const clientCache = createClientResourceCache();

  await Promise.all([
    serverCache.preload(resourceOne, "success"),
    serverCache.preload(resourceTwo, { status: "success" }),
    serverCache.preload(resourceOne, "error"),
    serverCache.preload(resourceTwo, { status: "error" }),
  ]);

  const serializedData = serverCache.serialize();
  clientCache.populate({ resourceOne, resourceTwo }, serializedData);

  const { container } = render(
    <ResourceCacheProvider cache={clientCache}>
      <AsyncResource resource={resourceOne} input="success" />
      {" | "}
      <AsyncResource resource={resourceTwo} input={{ status: "success" }} />
      {" | "}
      <AsyncResource resource={resourceOne} input="error" />
      {" | "}
      <AsyncResource resource={resourceTwo} input={{ status: "error" }} />
    </ResourceCacheProvider>,
  );

  expect(container).toHaveTextContent(
    "success: resource one data | " +
      "success: resource two data | " +
      "failure: resource one error | " +
      "failure: resource two error",
  );
});
