import React from "react";
import { css } from "@emotion/core";
import { rhythm, color } from "./theme";
import Container from "./container";

export default function Banner({ children, ...props }) {
  return (
    <header {...props} css={bannerStyles}>
      <Container>{children}</Container>
    </header>
  );
}

const bannerStyles = css`
  background-color: ${color("gray", 1)};
  border: solid ${color("gray", 3)};

  border-width: 0 0 1px 0;
  margin: 0 0 ${rhythm(1)} 0;
  padding: ${rhythm(0, 2)} 0 calc(${rhythm(0, 2)} - 1px) 0;
`;
