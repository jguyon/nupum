import React, { StrictMode } from "react";
import { hydrate } from "react-dom";
import { createBrowserHistory } from "history";
import App from "./app";

const history = createBrowserHistory();

hydrate(
  <StrictMode>
    <App history={history} />
  </StrictMode>,
  document.getElementById("root"),
);
