import React from "react";
import { css } from "@emotion/core";
import PropTypes from "prop-types";
import millify from "millify";
import { scale } from "../theme";
import Banner from "../banner";

export default function SearchPageBanner({ totalResults, query }) {
  return (
    <Banner>
      <h1 css={headingStyles}>
        <strong>{millify(totalResults, { precision: 1 })}</strong> results for "
        {query}"
      </h1>
    </Banner>
  );
}

SearchPageBanner.propTypes = {
  totalResults: PropTypes.number.isRequired,
  query: PropTypes.string.isRequired,
};

const headingStyles = css`
  ${scale(0, 1)}
  margin: 0;
  font-weight: normal;
`;
