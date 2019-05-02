import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/core";
import { rhythm, scale, color, compactLineHeight } from "./theme";
import { Link } from "../router";
import Container from "./container";
import Logo from "./logo";
import SearchForm from "./search-form";
import { useLocationFocus } from "./location-focus";

export default function Layout({ children }) {
  const focusRef = useLocationFocus();

  return (
    <>
      <header css={headerStyles}>
        <Container>
          <h1 css={headingStyles}>
            <Link css={headingLinkStyles} to="/">
              <Logo />
            </Link>
          </h1>

          <SearchForm css={formStyles} />
        </Container>
      </header>

      <Container tag="main" ref={focusRef} tabIndex={-1} css={mainStyles}>
        {children}
      </Container>
    </>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
};

const headerStyles = css`
  text-align: center;

  border: solid ${color("gray", 3)};
  border-width: 0 0 1px 0;

  padding: ${rhythm(1, -1)} 0;
`;

const headingStyles = css`
  ${scale(1, 0, compactLineHeight)}
  margin: 0;
`;

const headingLinkStyles = css`
  text-decoration: none;

  &:focus {
    outline: 1px dotted ${color("pink", 5)};
  }
`;

const formStyles = css`
  margin-top: ${rhythm(1, -1)};
`;

const mainStyles = css`
  outline: none;
`;
