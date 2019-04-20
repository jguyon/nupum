import React, { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import invariant from "tiny-invariant";
import { useNavigate, useMatch } from "../../router";

export default function SearchForm({ inputRef }) {
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
    <div role="search">
      <form onSubmit={onFormSubmit}>
        <input
          ref={inputRef}
          autoFocus={inputAutoFocus}
          type="search"
          aria-label="Search query"
          value={query}
          onChange={onInputChange}
          onFocus={onInputFocus}
        />

        <button type="submit">Search</button>
      </form>
    </div>
  );
}

SearchForm.propTypes = {
  inputRef: PropTypes.object,
};

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
