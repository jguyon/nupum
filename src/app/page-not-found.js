import React from "react";
import { Helmet } from "react-helmet-async";
import { useStatusCode } from "../router";

export default function PageNotFound() {
  useStatusCode(404);

  return (
    <>
      <Helmet>
        <title>Page not found | nupum</title>
      </Helmet>

      <h2>Page not found</h2>
    </>
  );
}
