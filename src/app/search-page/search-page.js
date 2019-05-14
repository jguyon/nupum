import React from "react";
import PropTypes from "prop-types";
import Container from "../container";
import SearchPageBanner from "./search-page-banner";
import SearchPageResult from "./search-page-result";

export default function SearchPage({ query, searchResults }) {
  return (
    <>
      <SearchPageBanner totalResults={searchResults.total} query={query} />

      <Container>
        {searchResults.results.map(({ package: pkg }) => (
          <SearchPageResult
            key={pkg.name}
            name={pkg.name}
            version={pkg.version}
            links={pkg.links}
            description={pkg.description}
            keywords={pkg.keywords}
            date={new Date(pkg.date)}
            publisher={pkg.publisher}
          />
        ))}
      </Container>
    </>
  );
}

SearchPage.propTypes = {
  query: PropTypes.string.isRequired,
  searchResults: PropTypes.object.isRequired,
};
