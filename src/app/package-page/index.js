import React from "react";
import PropTypes from "prop-types";
import { useModule, MODULE_SUCCESS, MODULE_FAILURE } from "../../module-cache";
import {
  useResource,
  RESOURCE_SUCCESS,
  RESOURCE_FAILURE,
} from "../../resource-cache";
import { packageInfo } from "../../resources";
import PageNotFound from "../page-not-found";
import LoadingPage from "../loading-page";
import ErrorPage from "../error-page";
import packagePage from "./package-page-module";

export default function LazyPackagePage({ name }) {
  const packagePageResult = useModule(packagePage);
  const packageInfoResult = useResource(packageInfo, name);

  if (
    packagePageResult.status === MODULE_SUCCESS &&
    packageInfoResult.status === RESOURCE_SUCCESS
  ) {
    const PackagePage = packagePageResult.module.default;

    if (packageInfoResult.data.found) {
      const packageInfo = packageInfoResult.data.data.collected;
      return <PackagePage packageInfo={packageInfo} />;
    } else {
      return <PageNotFound />;
    }
  } else if (
    packagePageResult.status === MODULE_FAILURE ||
    packageInfoResult.status === RESOURCE_FAILURE
  ) {
    return <ErrorPage msg="Could not fetch the package information" />;
  } else {
    return <LoadingPage name={`${name} package`} />;
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
