import React from "react";
import ErrorPage from "./error-page";

export default function PageNotFound() {
  return <ErrorPage code={404} msg="Page not found" />;
}
