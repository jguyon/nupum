import React, { StrictMode } from "react";
import { render as rtlRender, cleanup } from "react-testing-library";
import "jest-dom/extend-expect";
import serializer from "jest-emotion";
import { createMemoryHistory } from "history";
import Router from "../router";
import { createTestModuleCache, ModuleCacheProvider } from "../module-cache";
import {
  createTestResourceCache,
  ResourceCacheProvider,
} from "../resource-cache";

expect.addSnapshotSerializer(serializer);

afterEach(() => {
  cleanup();
});

export * from "react-testing-library";

export function render(ui) {
  const { rerender: rtlRerender, ...rest } = rtlRender(wrapUi(ui));

  function rerender(nextUi) {
    rtlRerender(wrapUi(nextUi));
  }

  return {
    ...rest,
    rerender,
  };
}

function wrapUi(ui) {
  return <StrictMode>{ui}</StrictMode>;
}

export function renderRoutesWithContext(
  routes,
  {
    history = createMemoryHistory(),
    moduleCache = createTestModuleCache(),
    resourceCache = createTestResourceCache(),
  } = {},
) {
  const { rerender: baseRerender, ...rest } = render(
    wrapRoutesWithContext(routes, {
      history,
      moduleCache,
      resourceCache,
    }),
  );

  function rerender(nextRoutes) {
    baseRerender(
      wrapRoutesWithContext(nextRoutes, {
        history,
        moduleCache,
        resourceCache,
      }),
    );
  }

  return {
    ...rest,
    history,
    moduleCache,
    rerender,
  };
}

function wrapRoutesWithContext(
  routes,
  { history, moduleCache, resourceCache },
) {
  return (
    <ModuleCacheProvider cache={moduleCache}>
      <ResourceCacheProvider cache={resourceCache}>
        <Router history={history} routes={routes} />
      </ResourceCacheProvider>
    </ModuleCacheProvider>
  );
}

export function renderWithContext(ui, options) {
  const { rerender: rerenderRoutes, ...rest } = renderRoutesWithContext(
    routesFromUi(ui),
    options,
  );

  function rerender(nextUi) {
    rerenderRoutes(routesFromUi(nextUi));
  }

  return {
    ...rest,
    rerender,
  };
}

function routesFromUi(ui) {
  return [
    {
      path: "/*",
      render: () => ui,
    },
  ];
}
