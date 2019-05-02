import React, { useMemo } from "react";
import PropTypes from "prop-types";
import invariant from "tiny-invariant";
import { Link } from "../../router";
import {
  useResource,
  RESOURCE_PENDING,
  RESOURCE_SUCCESS,
  RESOURCE_FAILURE,
} from "../../resource-cache";
import { packageSearch } from "../../resources";

export default function SearchPage({ location }) {
  const params = new URLSearchParams(location.search);
  const query = params.get("q");
  const packageSearchResult = useResource(
    packageSearch,
    useMemo(() => ({ query }), [query]),
  );

  const packages = (() => {
    switch (packageSearchResult.status) {
      case RESOURCE_PENDING: {
        return <p>Loading&hellip;</p>;
      }

      case RESOURCE_FAILURE: {
        return <p>Error!</p>;
      }

      case RESOURCE_SUCCESS: {
        const { data } = packageSearchResult;

        return data.results.map(({ package: pkg }) => (
          <div key={pkg.name}>
            <Link to={`/package/${encodeURIComponent(pkg.name)}`}>
              {pkg.name}
            </Link>{" "}
            <small>{pkg.version}</small>
          </div>
        ));
      }

      default: {
        invariant(false, `invalid status ${packageSearchResult.status}`);
      }
    }
  })();

  return (
    <>
      <h2>Search results for "{query || ""}"</h2>
      {packages}
    </>
  );
}

SearchPage.propTypes = {
  location: PropTypes.object.isRequired,
};
