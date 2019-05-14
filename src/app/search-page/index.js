import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useModule, MODULE_SUCCESS, MODULE_FAILURE } from "../../module-cache";
import {
  useResource,
  RESOURCE_SUCCESS,
  RESOURCE_FAILURE,
} from "../../resource-cache";
import { packageSearch } from "../../resources";
import LoadingPage from "../loading-page";
import ErrorPage from "../error-page";
import searchPage from "./search-page-module";

const RESULTS_PER_PAGE = 10;
// The npms api limits the `from` param to 10,000
const MAX_PAGE = Math.ceil(10000 / RESULTS_PER_PAGE);

export default function LazySearchPage({ location }) {
  const { query, page } = parseParams(location);
  const searchPageResult = useModule(searchPage);
  const packageSearchResult = useResource(
    packageSearch,
    useMemo(() => packageSearchOpts({ query, page }), [query, page]),
  );

  if (
    searchPageResult.status === MODULE_SUCCESS &&
    packageSearchResult.status === RESOURCE_SUCCESS
  ) {
    const SearchPage = searchPageResult.module.default;
    const { total, results } = packageSearchResult.data;

    return (
      <SearchPage
        query={query}
        page={page}
        maxPage={Math.min(MAX_PAGE, Math.ceil(total / RESULTS_PER_PAGE))}
        total={total}
        results={results}
      />
    );
  } else if (
    searchPageResult.status === MODULE_FAILURE ||
    packageSearchResult.status === RESOURCE_FAILURE
  ) {
    return <ErrorPage msg="Could not fetch the search results." />;
  } else {
    return <LoadingPage />;
  }
}

LazySearchPage.propTypes = {
  location: PropTypes.object.isRequired,
};

export function preloadSearchPage({ location, moduleCache, resourceCache }) {
  return Promise.all([
    moduleCache.preload(searchPage),
    resourceCache.preload(
      packageSearch,
      packageSearchOpts(parseParams(location)),
    ),
  ]);
}

function parseParams(location) {
  const params = new URLSearchParams(location.search);
  const query = params.get("q");
  const page = Math.max(1, parseInt(params.get("p"), 10));

  return {
    query: query === null ? "" : query,
    page: isNaN(page) ? 1 : page,
  };
}

function packageSearchOpts({ query, page }) {
  return {
    query,
    from: (page - 1) * RESULTS_PER_PAGE,
    size: RESULTS_PER_PAGE,
  };
}
