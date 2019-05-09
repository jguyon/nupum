import React from "react";
import PropTypes from "prop-types";
import { css, Global } from "@emotion/core";
import { normalize, hideVisually } from "polished";
import HeartIcon from "react-feather/dist/icons/heart";
import {
  establishRhythm,
  rhythm,
  scale,
  color,
  baseFontFamily,
  primaryColor,
} from "./theme";
import Container from "./container";

export default function RootLayout({ children }) {
  return (
    <>
      <Global styles={globalStyles} />

      {children}

      <Container tag="footer" css={footerStyles}>
        <p css={footerParagraphStyles}>
          Made with <Love /> by{" "}
          <a css={footerLinkStyles} href="https://github.com/jguyon">
            jguyon
          </a>
        </p>
        <p css={footerParagraphStyles}>
          Search is powered by{" "}
          <a css={footerLinkStyles} href="https://npms.io/">
            npms.io
          </a>
        </p>
        <p css={footerParagraphStyles}>
          Source code is available on{" "}
          <a css={footerLinkStyles} href="https://github.com/jguyon/nupum">
            GitHub
          </a>
        </p>
      </Container>
    </>
  );
}

RootLayout.propTypes = {
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

const footerStyles = css`
  ${scale(0, -1)}
  text-align: center;
  color: ${color("gray", 6)};

  margin-top: ${rhythm(1)};
  margin-bottom: ${rhythm(1)};
`;

const footerParagraphStyles = css`
  margin: 0;
`;

const footerLinkStyles = css`
  color: ${color(primaryColor, 6)};

  transition: text-decoration 0.15s ease-out;
  &:hover {
    text-decoration: underline transparent;
  }

  &:focus {
    outline: 1px dotted currentColor;
  }
`;

function Love() {
  return (
    <>
      <HeartIcon css={loveIconStyles} size="1em" aria-hidden />
      <span css={loveWordStyles}>love</span>
    </>
  );
}

const loveIconStyles = css`
  color: ${color(primaryColor, 6)};
`;

const loveWordStyles = css`
  ${hideVisually()}
`;
