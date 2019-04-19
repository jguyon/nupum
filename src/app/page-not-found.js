import React from "react";
import { useStatusCode } from "../router";

export default function PageNotFound() {
  useStatusCode(404);

  return <h2>Page not found</h2>;
}
