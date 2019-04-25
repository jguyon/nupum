import React, { StrictMode } from "react";
import { hydrate } from "react-dom";
import { createBrowserHistory } from "history";
import { createClientModuleCache } from "./module-cache";
import { createClientResourceCache } from "./resource-cache";
import * as resources from "./resources";
import App, { preloadApp } from "./app";

const history = createBrowserHistory();
const moduleCache = createClientModuleCache();
const resourceCache = createClientResourceCache({
  maxSize: 100,
  maxAge: 30 * 60 * 1000, // 30min
});

resourceCache.populate(
  resources,
  JSON.parse(document.getElementById("data").textContent),
);

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
      document.getElementById("root"),
    );
  },
  error => {
    console.error("preload error:", error);
  },
);
