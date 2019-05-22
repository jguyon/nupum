import React, { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";
import invariant from "tiny-invariant";
import { useMatch } from "../../router";

const SearchFormContext = createContext(null);

export default function SearchFormProvider({ children }) {
  const [query, setQuery] = useState(useUrlSearchQuery() || "");

  return (
    <SearchFormContext.Provider value={[query, setQuery]}>
      {children}
    </SearchFormContext.Provider>
  );
}

export function useSearchFormQuery() {
  const context = useContext(SearchFormContext);
  invariant(
    context,
    "expected <SearchForm/> to be wrapped in a <SearchFormProvider/>",
  );

  return context;
}

SearchFormProvider.propTypes = {
  children: PropTypes.node,
};

function useUrlSearchQuery() {
  const match = useMatch("/search");

  if (match) {
    const params = new URLSearchParams(match.location.search);
    return params.get("q");
  } else {
    return null;
  }
}
