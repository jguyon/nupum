import React, { StrictMode } from "react";
import { hydrate } from "react-dom";
import "./polyfill";
import { createBrowserHistory } from "history";
import { createClientModuleCache } from "../module-cache";
import { createClientResourceCache } from "../resource-cache";
import * as resources from "../resources";
import App, { preloadApp } from "../app";

const RESOURCE_CACHE_MAX_SIZE = 100;
const RESOURCE_CACHE_MAX_AGE = 30 * 60 * 1000; // 30min

const rootNode = document.getElementById("root");
const dataNode = document.getElementById("data");

renderApp(true);

if (module.hot) {
  module.hot.accept(
    ["../module-cache", "../resource-cache", "../resources", "../app"],
    () => {
      renderApp(false);
    },
  );
}

function renderApp(shouldPopulate) {
  const history = createBrowserHistory();
  const moduleCache = createClientModuleCache();
  const resourceCache = createClientResourceCache({
    maxSize: RESOURCE_CACHE_MAX_SIZE,
    maxAge: RESOURCE_CACHE_MAX_AGE,
  });

  if (shouldPopulate) {
    resourceCache.populate(resources, JSON.parse(dataNode.textContent));
  }

  preloadApp({
    history,
    moduleCache,
    resourceCache,
  }).then(
    () => {
      hydrate(
        <StrictMode>
          <App
            history={history}
            moduleCache={moduleCache}
            resourceCache={resourceCache}
          />
        </StrictMode>,
        rootNode,
      );
    },
    error => {
      console.error("preload error:", error);
    },
  );
}
