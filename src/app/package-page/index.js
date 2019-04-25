import React from "react";
import invariant from "tiny-invariant";
import {
  createModule,
  useModule,
  MODULE_PENDING,
  MODULE_SUCCESS,
  MODULE_FAILURE,
} from "../../module-cache";
import { packageInfo } from "../../resources";

const packagePage = createModule(
  () => import(/* webpackChunkName: "package-page" */ "./package-page"),
  "package-page",
);

export default function LazyPackagePage(props) {
  const packagePageResult = useModule(packagePage);

  switch (packagePageResult.status) {
    case MODULE_PENDING: {
      return <p>Loading&hellip;</p>;
    }

    case MODULE_FAILURE: {
      return <p>Error!</p>;
    }

    case MODULE_SUCCESS: {
      const PackagePage = packagePageResult.module.default;
      return <PackagePage {...props} />;
    }

    default: {
      invariant(false, `invalid status ${packagePageResult.status}`);
    }
  }
}

export function preloadPackagePage({ moduleCache, resourceCache, name }) {
  return Promise.all([
    moduleCache.preload(packagePage),
    resourceCache.preload(packageInfo, name),
  ]);
}
