import React from "react";
import { css } from "@emotion/core";

const wrapperStyles = css`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const headingStyles = css`
  font-family: sans-serif;
  color: pink;
`;

export default function App() {
  return (
    <div css={wrapperStyles}>
      <h1 css={headingStyles}>Hello, world!</h1>
    </div>
  );
}
