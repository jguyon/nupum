import React from "react";
import { css } from "@emotion/core";
import { Helmet } from "react-helmet-async";
import { rhythm, scale, color, compactLineHeight } from "./theme";
import { useLocationFocus } from "./location-focus";
import Container from "./container";
import Logo from "./logo";
import SearchForm from "./search-form";

export default function HomePage() {
  const focusRef = useLocationFocus();

  return (
    <>
      <Helmet>
        <title>nupum | Search for npm packages, fast.</title>
      </Helmet>

      <main css={mainStyles} ref={focusRef} tabIndex={-1}>
        <Container>
          <h1 css={headingStyles}>
            <Logo />
          </h1>
          <p css={descriptionStyles}>Search for npm packages, fast.</p>
          <SearchForm css={formStyles} />
        </Container>
      </main>
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
