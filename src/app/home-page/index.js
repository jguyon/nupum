import React from "react";
import { css } from "@emotion/core";
import SearchForm from "../search-form";
import { useLocationFocus } from "../location-focus";

export default function HomePage() {
  const focusRef = useLocationFocus();

  return (
    <div css={parentStyles}>
      <div css={childStyles}>
        <h1>nupum</h1>
        <SearchForm inputRef={focusRef} />
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
