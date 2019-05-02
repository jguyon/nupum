import React from "react";
import { css } from "@emotion/core";
import { rhythm, scale, color, compactLineHeight } from "../theme";
import { useLocationFocus } from "../location-focus";
import Container from "../container";
import Logo from "../logo";
import SearchForm from "../search-form";

export default function HomePage() {
  const focusRef = useLocationFocus();

  return (
    <div css={parentStyles}>
      <Container css={containerStyles}>
        <h1 css={headingStyles}>
          <Logo />
        </h1>
        <p css={descriptionStyles}>Search for npm packages, fast.</p>
        <SearchForm css={formStyles} inputRef={focusRef} />
      </Container>
    </div>
  );
}

const parentStyles = css`
  min-height: 100vh;

  display: flex;
  align-items: center;
`;

const containerStyles = css`
  width: 100%;
  padding-top: ${rhythm(1)};
  padding-bottom: ${rhythm(1)};

  text-align: center;
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
