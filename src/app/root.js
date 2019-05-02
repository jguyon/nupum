import React from "react";
import PropTypes from "prop-types";
import { css, Global } from "@emotion/core";
import { normalize } from "polished";
import { establishRhythm, color, baseFontFamily, primaryColor } from "./theme";

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
  ${establishRhythm()}

  html {
    box-sizing: border-box;
  }
  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }

  html {
    overflow-y: scroll;
  }

  body {
    margin: 0;
    padding: 0;

    background-color: ${color("white")};
    color: ${color("gray", 9)};

    font-family: ${baseFontFamily};
  }

  ::selection {
    background-color: ${color(primaryColor, 5)};
    color: ${color("white")};
  }
`;
