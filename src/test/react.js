import React, { StrictMode } from "react";
import { render as rtlRender, cleanup } from "react-testing-library";
import "jest-dom/extend-expect";
import serializer from "jest-emotion";
import { createMemoryHistory } from "history";
import Router from "../router";

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
  { history = createMemoryHistory() } = {},
) {
  const { rerender: baseRerender, ...rest } = render(
    wrapRoutesWithContext(routes, { history }),
  );

  function rerender(nextRoutes) {
    baseRerender(wrapRoutesWithContext(nextRoutes, { history }));
  }

  return {
    ...rest,
    history,
    rerender,
  };
}

function wrapRoutesWithContext(routes, { history }) {
  return <Router history={history} routes={routes} />;
}

export function renderWithContext(ui, options) {
  const { rerender: rerenderRoutes, ...rest } = renderRoutesWithContext(
    routesFromUi(ui),
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
