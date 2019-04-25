import React from "react";
import PropTypes from "prop-types";
import invariant from "tiny-invariant";
import { useStatusCode } from "../../router";
import {
  useResource,
  RESOURCE_PENDING,
  RESOURCE_SUCCESS,
  RESOURCE_FAILURE,
} from "../../resource-cache";
import { packageInfo } from "../../resources";

export default function PackagePage({ name }) {
  const packageInfoResult = useResource(packageInfo, name);

  switch (packageInfoResult.status) {
    case RESOURCE_PENDING: {
      return <p>Loading&hellip;</p>;
    }

    case RESOURCE_FAILURE: {
      return <p>Error!</p>;
    }

    case RESOURCE_SUCCESS: {
      if (packageInfoResult.data.found) {
        const pkg = packageInfoResult.data.data.collected;
        return <ShowPackage pkg={pkg} />;
      } else {
        return <PackageNotFound />;
      }
    }

    default: {
      invariant(false, `invalid status ${packageInfoResult.status}`);
    }
  }
}

PackagePage.propTypes = {
  name: PropTypes.string.isRequired,
};

function PackageNotFound() {
  useStatusCode(404);

  return <p>Package not found!</p>;
}

function ShowPackage({ pkg }) {
  return (
    <>
      <h2>
        {pkg.metadata.name} <small>{pkg.metadata.version}</small>
      </h2>

      {pkg.metadata.readme ? <pre>{pkg.metadata.readme}</pre> : null}
    </>
  );
}
