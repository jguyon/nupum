import React from "react";
import { css } from "@emotion/core";
import PropTypes from "prop-types";
import millify from "millify";
import TagIcon from "react-feather/dist/icons/tag";
import LinkIcon from "react-feather/dist/icons/link";
import HomeIcon from "react-feather/dist/icons/home";
import GitIcon from "react-feather/dist/icons/git-branch";
import TimeAgo from "react-timeago";
import Gravatar from "react-gravatar";
import { stripUnit } from "polished";
import { Link } from "../../router";
import { rhythm, scale, color, primaryColor, baseFontSize } from "../theme";
import Banner from "../banner";
import Container from "../container";

export default function SearchPage({ query, searchResults }) {
  return (
    <>
      <Banner>
        <h2 css={searchPageHeadingStyles}>
          <strong>{millify(searchResults.total, { precision: 1 })}</strong>{" "}
          results for "{query}"
        </h2>
      </Banner>

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
  margin: 0;
  font-weight: normal;
`;

function SearchResult({ searchResult: { package: pkg } }) {
  return (
    <article css={searchResultStyles}>
      <header>
        <h3 css={searchResultHeadingStyles}>
          <Link
            css={searchResultNameStyles}
            to={`/package/${encodeURIComponent(pkg.name)}`}
          >
            {pkg.name}
          </Link>{" "}
          <small css={searchResultVersionStyles}>{pkg.version}</small>
        </h3>

        <ul css={searchResultLinkListStyles} aria-label="Package links">
          <li css={searchResultLinkListItemStyles}>
            <a
              css={searchResultLinkListItemLinkStyles}
              href={pkg.links.npm}
              aria-label="NPM page"
            >
              <LinkIcon size="1em" />
            </a>
          </li>
          {pkg.links.homepage ? (
            <li css={searchResultLinkListItemStyles}>
              <a
                css={searchResultLinkListItemLinkStyles}
                href={pkg.links.homepage}
                aria-label="Homepage"
              >
                <HomeIcon size="1em" />
              </a>
            </li>
          ) : null}
          {pkg.links.repository ? (
            <li css={searchResultLinkListItemStyles}>
              <a
                css={searchResultLinkListItemLinkStyles}
                href={pkg.links.repository}
                aria-label="Repository"
              >
                <GitIcon size="1em" />
              </a>
            </li>
          ) : null}
        </ul>
      </header>

      {pkg.description ? (
        <p css={searchResultDescriptionStyles}>{pkg.description}</p>
      ) : null}

      {pkg.keywords && pkg.keywords.length > 0 ? (
        <div css={searchResultKeywordsStyles}>
          <TagIcon
            css={searchResultKeywordsIconStyles}
            aria-hidden
            size="1em"
          />{" "}
          <ul css={searchResultKeywordListStyles} aria-label="Keywords">
            {pkg.keywords.map(keyword => (
              <li key={keyword} css={searchResultKeywordStyles}>
                <Link
                  css={searchResultKeywordLinkStyles}
                  to={`/search?q=${encodeURIComponent(keyword)}`}
                >
                  {keyword}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p css={searchResultPublicationStyles}>
        published <TimeAgo date={pkg.date} /> by{" "}
        <span css={searchResultPublicationAvatarStyles}>
          <Gravatar
            email={pkg.publisher.email}
            size={searchResultPublicationAvatarSize}
          />
        </span>{" "}
        <a
          css={searchResultPublicationLinkStyles}
          href={`https://www.npmjs.com/~${pkg.publisher.username}`}
        >
          {pkg.publisher.username}
        </a>{" "}
      </p>
    </article>
  );
}

const searchResultStyles = css`
  margin: ${rhythm(1)} 0;
`;

const searchResultHeadingStyles = css`
  ${scale(0, 2)}
  display: inline-block;
  margin: 0;
`;

const searchResultNameStyles = css`
  color: ${color(primaryColor, 8)};
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
  color: ${color("gray", 6)};
`;

const searchResultLinkListStyles = css`
  display: inline-block;
  margin: 0;
  padding: 0;
`;

const searchResultLinkListItemStyles = css`
  display: inline-block;
  margin-left: ${rhythm(0, 1)};
`;

const searchResultLinkListItemLinkStyles = css`
  color: ${color("gray", 8)};

  &:focus {
    outline: 1px dotted currentColor;
  }
`;

const searchResultDescriptionStyles = css`
  margin: 0;
`;

const searchResultKeywordsStyles = css`
  ${scale(0, -1)}
  color: ${color("gray", 6)};
`;

const searchResultKeywordsIconStyles = css`
  vertical-align: middle;
`;

const searchResultKeywordListStyles = css`
  display: inline;
  margin: 0;
  padding: 0;
`;

const searchResultKeywordStyles = css`
  display: inline;

  li + &::before {
    content: ", ";
  }
`;

const searchResultKeywordLinkStyles = css`
  color: inherit;
  text-decoration: underline transparent;

  transition: text-decoration 0.15s ease-out;
  &:hover {
    text-decoration: underline;
  }

  &:focus {
    outline: 1px dotted currentColor;
  }
`;

const searchResultPublicationStyles = css`
  ${scale(0, -1, 1)}
  margin: 0;
  color: ${color("gray", 6)};
`;

const searchResultPublicationAvatarStyles = css`
  display: inline-block;
  vertical-align: middle;

  border-radius: 50%;
  overflow: hidden;

  width: ${rhythm(1)};
  height: ${rhythm(1)};

  border: 2px solid ${color("gray", 8)};
`;

const searchResultPublicationAvatarSize = (() => {
  return stripUnit(rhythm(1)) * baseFontSize - 4;
})();

const searchResultPublicationLinkStyles = css`
  color: ${color("gray", 8)};
  text-decoration: underline transparent;

  transition: text-decoration 0.15s ease-out;
  &:hover {
    text-decoration: underline;
  }

  &:focus {
    outline: 1px dotted currentColor;
  }
`;
