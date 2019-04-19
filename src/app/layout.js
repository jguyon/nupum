import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/core";
import { Link } from "../router";
import SearchForm from "./search-form";

export default function Layout({ children }) {
  return (
    <>
      <header css={headerStyles}>
        <h1>
          <Link to="/">nupum</Link>
        </h1>

        <SearchForm />
      </header>

      <hr />

      <main>{children}</main>
    </>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
};

const headerStyles = css`
  text-align: center;
`;
