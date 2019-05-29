import React, { Component } from "react";
import { css, Global } from "@emotion/core";
import { establish, rhythm, scale, color, baseFontFamily } from "./theme";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <Global styles={globalStyles} />
          <p css={paragraphStyles}>An unrecoverable error occurred.</p>
        </>
      );
    } else {
      return this.props.children;
    }
  }
}

const globalStyles = css`
  ${establish()}

  body {
    margin: 0;
    padding: 0;

    font-family: ${baseFontFamily};
  }
`;

const paragraphStyles = css`
  ${scale(0, 1)}
  color: ${color("red", 7)};
  text-align: center;
  margin: ${rhythm(4)} ${rhythm(1)};
`;
