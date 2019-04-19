import React from "react";
import { css } from "@emotion/core";
import SearchForm from "../search-form";

export default function HomePage() {
  return (
    <div css={parentStyles}>
      <div css={childStyles}>
        <h1>nupum</h1>
        <SearchForm />
      </div>
    </div>
  );
}

const parentStyles = css`
  min-height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const childStyles = css`
  text-align: center;
`;
