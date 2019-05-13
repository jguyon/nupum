import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  createModule,
  useModule,
  MODULE_SUCCESS,
  MODULE_FAILURE,
} from "../../module-cache";
import {
  useResource,
  RESOURCE_SUCCESS,
  RESOURCE_FAILURE,
} from "../../resource-cache";
import { packageSearch } from "../../resources";
import LoadingPage from "../loading-page";
import ErrorPage from "../error-page";
import searchPage from "./search-page-module";

export default function LazySearchPage({ location }) {
  const query = getQueryParam(location);
  const searchPageResult = useModule(searchPage);
  const packageSearchResult = useResource(
    packageSearch,
    useMemo(() => ({ query }), [query]),
  );

  if (
    searchPageResult.status === MODULE_SUCCESS &&
    packageSearchResult.status === RESOURCE_SUCCESS
  ) {
    const SearchPage = searchPageResult.module.default;
    const searchResults = packageSearchResult.data;

    return <SearchPage query={query} searchResults={searchResults} />;
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
  const query = getQueryParam(location);

  return Promise.all([
    moduleCache.preload(searchPage),
    resourceCache.preload(packageSearch, { query }),
  ]);
}

function getQueryParam(location) {
  const params = new URLSearchParams(location.search);
  return params.get("q");
}
