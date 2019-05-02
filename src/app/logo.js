import React from "react";
import { css } from "@emotion/core";
import { color, primaryColor } from "./theme";

export default function Logo() {
  return (
    <span css={logoStyles}>
      n<span css={paleStyles}>u</span>p<span css={paleStyles}>u</span>m
    </span>
  );
}

const logoStyles = css`
  font-weight: bold;
  color: ${color(primaryColor, 5)};
`;

const paleStyles = css`
  color: ${color(primaryColor, 3)};
`;
