import React from "react";
import PropTypes from "prop-types";

export default function PackagePage({ name }) {
  return <h2>{name}</h2>;
}

PackagePage.propTypes = {
  name: PropTypes.string.isRequired,
};
