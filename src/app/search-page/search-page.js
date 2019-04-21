import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "../../router";

export default function SearchPage({ location }) {
  const params = new URLSearchParams(location.search);
  const query = params.get("q");

  return (
    <>
      <h2>Search results for "{query || ""}"</h2>

      {query
        ? query
            .split(/\s/)
            .filter(Boolean)
            .map(name => (
              <Fragment key={name}>
                <Link to={`/package/${encodeURIComponent(name)}`}>{name}</Link>
                <br />
              </Fragment>
            ))
        : null}
    </>
  );
}

SearchPage.propTypes = {
  location: PropTypes.object.isRequired,
};
