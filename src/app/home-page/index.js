import React from "react";
import { css } from "@emotion/core";
import HeartIcon from "react-feather/dist/icons/heart";
import { rhythm, scale, color, compactLineHeight } from "../theme";
import { useLocationFocus } from "../location-focus";
import Container from "../container";
import Logo from "../logo";
import SearchForm from "../search-form";

export default function HomePage() {
  const focusRef = useLocationFocus();

  return (
    <>
      <main css={mainStyles} ref={focusRef} tabIndex="-1">
        <Container>
          <h1 css={headingStyles}>
            <Logo />
          </h1>
          <p css={descriptionStyles}>Search for npm packages, fast.</p>
          <SearchForm css={formStyles} />
        </Container>
      </main>

      <Container tag="footer" css={footerStyles}>
        <p css={footerParagraphStyles}>
          Made with <HeartIcon css={footerIconStyles} size="1em" /> by{" "}
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

const mainStyles = css`
  outline: none;

  text-align: center;
  border: solid ${color("gray", 3)};

  border-width: 0 0 1px 0;
  padding: ${rhythm(1, -1)} 0 calc(${rhythm(1, -1)} - 1px) 0;
  margin-top: ${rhythm(3)};
`;

const headingStyles = css`
  ${scale(2, 0, compactLineHeight)}
  margin: 0;
`;

const descriptionStyles = css`
  ${scale(0, 2, compactLineHeight)}
  margin: 0;
  color: ${color("gray", 5)};
`;

const formStyles = css`
  margin-top: ${rhythm(1)};
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

const footerIconStyles = css`
  color: ${color("pink", 6)};
`;

const footerLinkStyles = css`
  color: ${color("pink", 6)};

  transition: text-decoration 0.15s ease-out;
  &:hover {
    text-decoration: underline transparent;
  }

  &:focus {
    outline: 1px dotted currentColor;
  }
`;
