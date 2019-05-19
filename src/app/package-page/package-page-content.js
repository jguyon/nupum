import React from "react";
import { css } from "@emotion/core";
import { rhythm, color } from "../theme";
import Container from "../container";

export function PackagePageContentRow({ children }) {
  return (
    <Container>
      <div css={contentRowStyles}>{children}</div>
    </Container>
  );
}

export function PackagePageContentMain({ children }) {
  return <section css={contentMainColumnStyles}>{children}</section>;
}

export function PackagePageContentAside({ children }) {
  return <aside css={contentAsideColumnStyles}>{children}</aside>;
}

const contentRowBreakpoint = "@media (min-width: 56em)";

const contentRowStyles = css`
  margin: ${rhythm(1)} 0;

  ${contentRowBreakpoint} {
    display: flex;
    align-items: flex-start;
  }
`;

const contentMainColumnStyles = css`
  border-top: 1px solid ${color("gray", 3)};
  padding-top: calc(${rhythm(1)} - 1px);

  ${contentRowBreakpoint} {
    border-top: 0;
    padding-top: 0;

    // prefer overflows inside the main container rather than pushing the aside
    // container to the right
    min-width: 0;

    order: 1;
    flex-grow: 1;
  }
`;

const contentAsideColumnStyles = css`
  ${contentRowBreakpoint} {
    width: ${rhythm(10, 2)};
    margin-left: ${rhythm(0, 2)};
    border-left: 1px solid ${color("gray", 3)};
    padding-left: calc(${rhythm(0, 2)} - 1px);

    order: 2;
    flex-shrink: 0;
  }
`;
