import React from "react";
import PropTypes from "prop-types";
import { css, Global } from "@emotion/core";
import { normalize } from "polished";

export default function Root({ children }) {
  return (
    <>
      <Global styles={globalStyles} />
      {children}
    </>
  );
}

Root.propTypes = {
  children: PropTypes.node,
};

const globalStyles = css`
  ${normalize()}

  html {
    overflow-y: scroll;
  }

  body {
    margin: 0;
    padding: 0;

    background-color: white;
    color: rgba(0, 0, 0, 0.9);

    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }
`;
