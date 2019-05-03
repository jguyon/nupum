import React from "react";
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
import { packageInfo } from "../../resources";
import PageNotFound from "../page-not-found";

const packagePage = createModule(
  () => import(/* webpackChunkName: "package-page" */ "./package-page"),
  "package-page",
);

export default function LazyPackagePage({ name }) {
  const packagePageResult = useModule(packagePage);
  const packageInfoResult = useResource(packageInfo, name);

  if (
    packagePageResult.status === MODULE_SUCCESS &&
    packageInfoResult.status === RESOURCE_SUCCESS
  ) {
    const PackagePage = packagePageResult.module.default;

    if (packageInfoResult.data.found) {
      const packageInfo = packageInfoResult.data.data;
      return <PackagePage packageInfo={packageInfo} />;
    } else {
      return <PageNotFound />;
    }
  } else if (
    packagePageResult.status === MODULE_FAILURE ||
    packageInfoResult.status === RESOURCE_FAILURE
  ) {
    return <p>Error!</p>;
  } else {
    return <p>Loading&hellip;</p>;
  }
}

LazyPackagePage.propTypes = {
  name: PropTypes.string.isRequired,
};

export function preloadPackagePage({ moduleCache, resourceCache, name }) {
  return Promise.all([
    moduleCache.preload(packagePage),
    resourceCache.preload(packageInfo, name),
  ]);
}
