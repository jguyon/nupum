import React from "react";
import invariant from "tiny-invariant";
import {
  createModule,
  useModule,
  MODULE_PENDING,
  MODULE_SUCCESS,
  MODULE_FAILURE,
} from "../../module-cache";

const packagePageModule = createModule(
  () => import(/* webpackChunkName: "package-page" */ "./package-page"),
  "package-page",
);

export default function LazyPackagePage(props) {
  const packagePage = useModule(packagePageModule);

  switch (packagePage.status) {
    case MODULE_PENDING: {
      return <p>Loading&hellip;</p>;
    }

    case MODULE_FAILURE: {
      return <p>Error!</p>;
    }

    case MODULE_SUCCESS: {
      const PackagePage = packagePage.module.default;
      return <PackagePage {...props} />;
    }

    default: {
      invariant(false, `invalid status ${packagePage.status}`);
    }
  }
}

export function preloadPackagePage({ moduleCache }) {
  return moduleCache.preload(packagePageModule);
}
