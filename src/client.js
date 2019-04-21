import React, { StrictMode } from "react";
import { hydrate } from "react-dom";
import { createBrowserHistory } from "history";
import { createClientModuleCache } from "./module-cache";
import App, { preloadApp } from "./app";

const history = createBrowserHistory();
const moduleCache = createClientModuleCache();

preloadApp({ history, moduleCache }).then(
  () => {
    hydrate(
      <StrictMode>
        <App history={history} moduleCache={moduleCache} />
      </StrictMode>,
      document.getElementById("root"),
    );
  },
  error => {
    console.error("preload error:", error);
  },
);
