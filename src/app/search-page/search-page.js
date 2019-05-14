import React from "react";
import PropTypes from "prop-types";
import Container from "../container";
import SearchPageBanner from "./search-page-banner";
import SearchPageResult from "./search-page-result";
import SearchPagePagination from "./search-page-pagination";

export default function SearchPage({ query, page, maxPage, total, results }) {
  return (
    <>
      <SearchPageBanner totalResults={total} query={query} />

      <Container>
        <section aria-label="Search results">
          {results.map(({ package: pkg }) => (
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
        </section>

        <SearchPagePagination
          query={query}
          currentPage={page}
          maxPage={maxPage}
          totalResults={total}
        />
      </Container>
    </>
  );
}

SearchPage.propTypes = {
  query: PropTypes.string.isRequired,
  page: PropTypes.number.isRequired,
  maxPage: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  results: PropTypes.array.isRequired,
};
