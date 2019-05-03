import React from "react";
import { css } from "@emotion/core";
import PropTypes from "prop-types";
import { Link } from "../../router";
import { rhythm, scale, color, primaryColor } from "../theme";
import Container from "../container";

export default function SearchPage({ query, searchResults }) {
  return (
    <>
      <h2 css={searchPageHeadingStyles}>
        <Container>
          <strong>{searchResults.total}</strong> results for "{query}"
        </Container>
      </h2>

      <Container>
        {searchResults.results.map(searchResult => (
          <SearchResult
            key={searchResult.package.name}
            searchResult={searchResult}
          />
        ))}
      </Container>
    </>
  );
}

SearchPage.propTypes = {
  query: PropTypes.string.isRequired,
  searchResults: PropTypes.object.isRequired,
};

const searchPageHeadingStyles = css`
  ${scale(0, 1)}
  font-weight: normal;

  background-color: ${color("gray", 1)};
  border: solid ${color("gray", 3)};

  border-width: 0 0 1px 0;
  margin: 0 0 ${rhythm(1)} 0;
  padding: ${rhythm(0, 2)} 0 calc(${rhythm(0, 2)} - 1px) 0;
`;

function SearchResult({ searchResult: { package: pkg } }) {
  return (
    <article css={searchResultStyles}>
      <h3 css={searchResultHeadingStyles}>
        <Link
          css={searchResultNameStyles}
          to={`/package/${encodeURIComponent(pkg.name)}`}
        >
          {pkg.name}
        </Link>{" "}
        <small css={searchResultVersionStyles}>{pkg.version}</small>
      </h3>

      {pkg.description ? (
        <p css={searchResultDescriptionStyles}>{pkg.description}</p>
      ) : null}
    </article>
  );
}

const searchResultStyles = css`
  margin: ${rhythm(1)} 0;
`;

const searchResultHeadingStyles = css`
  ${scale(0, 2)}
  margin: 0;
`;

const searchResultNameStyles = css`
  color: ${color(primaryColor, 7)};
  text-decoration: underline transparent;

  transition: text-decoration 0.15s ease-out;
  &:hover {
    text-decoration: underline;
  }

  &:focus {
    outline: 1px dotted currentColor;
  }
`;

const searchResultVersionStyles = css`
  ${scale(0, -1)}
  font-weight: normal;
  color: ${color("gray", 7)};
`;

const searchResultDescriptionStyles = css`
  margin: 0;
`;
