import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/core";
import { Link } from "../router";
import SearchForm from "./search-form";
import { useLocationFocus } from "./location-focus";

export default function Layout({ children }) {
  const focusRef = useLocationFocus();

  return (
    <>
      <header css={headerStyles}>
        <h1>
          <Link to="/">nupum</Link>
        </h1>

        <SearchForm />
      </header>

      <hr />

      <main ref={focusRef} tabIndex={-1} css={mainStyles}>
        {children}
      </main>
    </>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
};

const headerStyles = css`
  text-align: center;
`;

const mainStyles = css`
  outline: none;
`;
