import React from "react";
import invariant from "tiny-invariant";
import {
  createModule,
  useModule,
  MODULE_PENDING,
  MODULE_SUCCESS,
  MODULE_FAILURE,
} from "../../module-cache";

const searchPageModule = createModule(
  () => import(/* webpackChunkName: "search-page" */ "./search-page"),
  "search-page",
);

export default function LazySearchPage(props) {
  const searchPage = useModule(searchPageModule);

  switch (searchPage.status) {
    case MODULE_PENDING: {
      return <p>Loading&hellip;</p>;
    }

    case MODULE_FAILURE: {
      return <p>Error!</p>;
    }

    case MODULE_SUCCESS: {
      const SearchPage = searchPage.module.default;
      return <SearchPage {...props} />;
    }

    default: {
      invariant(false, `invalid status ${searchPage.status}`);
    }
  }
}

export function preloadSearchPage({ moduleCache }) {
  return moduleCache.preload(searchPageModule);
}
