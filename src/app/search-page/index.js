import React from "react";
import invariant from "tiny-invariant";
import {
  createModule,
  useModule,
  MODULE_PENDING,
  MODULE_SUCCESS,
  MODULE_FAILURE,
} from "../../module-cache";
import { packageSearch } from "../../resources";

const searchPage = createModule(
  () => import(/* webpackChunkName: "search-page" */ "./search-page"),
  "search-page",
);

export default function LazySearchPage(props) {
  const searchPageResult = useModule(searchPage);

  switch (searchPageResult.status) {
    case MODULE_PENDING: {
      return <p>Loading&hellip;</p>;
    }

    case MODULE_FAILURE: {
      return <p>Error!</p>;
    }

    case MODULE_SUCCESS: {
      const SearchPage = searchPageResult.module.default;
      return <SearchPage {...props} />;
    }

    default: {
      invariant(false, `invalid status ${searchPageResult.status}`);
    }
  }
}

export function preloadSearchPage({ location, moduleCache, resourceCache }) {
  const params = new URLSearchParams(location.search);
  const query = params.get("q");

  return Promise.all([
    moduleCache.preload(searchPage),
    resourceCache.preload(packageSearch, { query }),
  ]);
}
