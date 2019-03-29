import React, { StrictMode } from "react";
import { hydrate } from "react-dom";
import App from "./app";

hydrate(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById("root"),
);
