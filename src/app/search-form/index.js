import React, { createContext, useContext, useState } from "react";
import { css } from "@emotion/core";
import PropTypes from "prop-types";
import invariant from "tiny-invariant";
import { useNavigate, useMatch } from "../../router";
import { rhythm, color, primaryColor } from "../theme";

export default function SearchForm({ inputRef, ...props }) {
  const [query, setQuery] = useSearchFormContext();
  const navigate = useNavigate();
  const inputAutoFocus = !!useMatch("/");

  function onInputChange(event) {
    setQuery(event.target.value);
  }

  function onInputFocus(event) {
    event.target.select();
  }

  function onFormSubmit(event) {
    event.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div {...props} role="search">
      <form css={formStyles} onSubmit={onFormSubmit}>
        <input
          css={inputStyles}
          ref={inputRef}
          autoFocus={inputAutoFocus}
          type="search"
          aria-label="Search query"
          value={query}
          onChange={onInputChange}
          onFocus={onInputFocus}
        />

        <button css={submitStyles} type="submit">
          Search
        </button>
      </form>
    </div>
  );
}

SearchForm.propTypes = {
  inputRef: PropTypes.object,
};

const formStyles = css`
  display: flex;
`;

const inputStyles = css`
  flex-grow: 1;

  min-width: 0;
  height: ${rhythm(1, 2)};
  padding: 0 ${rhythm(1, -1)} 0 ${rhythm(1)};

  border: 1px solid ${color("gray", 5)};
  border-right-width: 0;
  border-top-left-radius: 999px;
  border-bottom-left-radius: 999px;

  &:focus {
    outline: none;
  }

  // https://blog.maximerouiller.com/post/remove-the-x-from-internet-explorer-and-chrome-input-type-search/
  &::-ms-clear,
  &::-ms-reveal {
    display: none;
    width: 0;
    height: 0;
  }
  &::-webkit-search-decoration,
  &::-webkit-search-cancel-button,
  &::-webkit-search-results-button,
  &::-webkit-search-results-decoration {
    display: none;
  }
`;

const submitStyles = css`
  height: ${rhythm(1, 2)};
  padding: 0 ${rhythm(1)} 0 ${rhythm(1, -1)};

  border: 0;
  border-top-right-radius: 999px;
  border-bottom-right-radius: 999px;

  background-color: ${color(primaryColor, 5)};
  color: ${color("white")};

  cursor: pointer;

  transition: background-color 0.15s ease-out;
  &:hover,
  &:focus {
    outline: none;
    background-color: ${color(primaryColor, 3)};
  }
`;

const SearchFormContext = createContext(null);

function useSearchFormContext() {
  const context = useContext(SearchFormContext);
  invariant(
    context,
    "expected <SearchForm/> to be wrapped in a <SearchFormProvider/>",
  );

  return context;
}

export function SearchFormProvider({ children }) {
  const [query, setQuery] = useState(useSearchQuery() || "");

  return (
    <SearchFormContext.Provider value={[query, setQuery]}>
      {children}
    </SearchFormContext.Provider>
  );
}

SearchFormProvider.propTypes = {
  children: PropTypes.node,
};

function useSearchQuery() {
  const match = useMatch("/search");

  if (match) {
    const params = new URLSearchParams(match.location.search);
    return params.get("q");
  } else {
    return null;
  }
}
