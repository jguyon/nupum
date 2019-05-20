import React from "react";
import { css } from "@emotion/core";
import PropTypes from "prop-types";
import Markdown from "react-markdown";
import {
  rhythm,
  scale,
  color,
  compactLineHeight,
  monoFontFamily,
  primaryColor,
} from "../theme";

export default function PackagePageReadme({ contents }) {
  if (contents) {
    return <Markdown css={readmeStyles} escapeHtml={false} source={contents} />;
  } else {
    return <p css={noReadmeStyles}>This package has no readme.</p>;
  }
}

PackagePageReadme.propTypes = {
  contents: PropTypes.string,
};

const noReadmeStyles = css`
  margin: 0 0 ${rhythm(1)} 0;
`;

const readmeStyles = css`
  p {
    margin: 0 0 ${rhythm(1)} 0;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0 0 ${rhythm(1)} 0;
    color: ${color("gray", 8)};
  }
  h1 {
    ${scale(1, 0, compactLineHeight)}
  }
  h2 {
    ${scale(0, 3, compactLineHeight)}
  }
  h3 {
    ${scale(0, 2, compactLineHeight)}
  }
  h4,
  h5,
  h6 {
    ${scale(0, 0, compactLineHeight)}
  }

  blockquote {
    margin: 0 0 ${rhythm(1)} 0;
    padding 0 0 0 calc(${rhythm(1)} - 2px);
    border-left: solid ${color("gray", 3)};
  }

  ul, ol {
    margin: 0 0 ${rhythm(1)} 0;
    padding: 0 0 0 ${rhythm(2, -1)};
  }

  dl {
    margin: 0 0 ${rhythm(1)} 0;
  }
  dd {
    margin-left: ${rhythm(1)};
  }

  hr {
    border: 0;
    background-color: ${color("gray", 3)};
    height: 1px;
    margin: 0 0 calc(${rhythm(1)} - 1px) 0;
  }

  pre {
    background-color: ${color("gray", 0)};
    border: 1px solid ${color("gray", 5)};
    border-radius: 3px;

    padding: calc(${rhythm(0, 1)} - 1px);
    margin: 0 0 ${rhythm(1)} 0;

    overflow-y: auto;
  }
  pre, code {
    ${scale(0, -1, compactLineHeight)}
    font-family: ${monoFontFamily};
    color: ${color("gray", 7)};
  }

  table {
    margin: 0 0 ${rhythm(1)} 0;
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
  }
  td, th {
    border-bottom: 1px solid ${color("gray", 3)};
    padding:
      ${rhythm(0, 1)}
      ${rhythm(0, 1)}
      calc(${rhythm(0, 1)} - 1px)
      ${rhythm(0, 1)};

    &:first-of-type {
      padding-left: 0;
    }
    &:last-of-type {
      padding-right: 0;
    }
  }

  img {
    max-width: 100%;
  }

  a {
    color: ${color(primaryColor, 7)};

    text-decoration: none;
    @supports (text-decoration: underline transparent) {
      text-decoration: underline transparent;
    }

    transition: text-decoration 0.15s ease-out;
    &:hover {
      text-decoration: underline;
    }

    &:focus {
      outline: 1px dotted currentColor;
    }
  }
`;
