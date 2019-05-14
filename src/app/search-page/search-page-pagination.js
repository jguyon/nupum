import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/core";
import PrevIcon from "react-feather/dist/icons/chevron-left";
import NextIcon from "react-feather/dist/icons/chevron-right";
import FirstIcon from "react-feather/dist/icons/chevrons-left";
import LastIcon from "react-feather/dist/icons/chevrons-right";
import { Link } from "../../router";
import { rhythm, scale, color, primaryColor } from "../theme";

export default function SearchPagePagination({ query, currentPage, maxPage }) {
  return (
    <PageList>
      {currentPage > 1 && (
        <>
          <PageItem query={query} page={1} label="First page">
            <PageItemIcon icon={FirstIcon} />
          </PageItem>
          <PageItem query={query} page={currentPage - 1} label="Previous page">
            <PageItemIcon icon={PrevIcon} />
          </PageItem>
        </>
      )}

      <PageItem
        query={query}
        page={currentPage}
        label={`Page ${currentPage}`}
        current
      >
        {currentPage}
      </PageItem>

      {currentPage < maxPage && (
        <>
          <PageItem query={query} page={currentPage + 1} label="Next page">
            <PageItemIcon icon={NextIcon} />
          </PageItem>
          <PageItem query={query} page={maxPage} label="Last page">
            <PageItemIcon icon={LastIcon} />
          </PageItem>
        </>
      )}
    </PageList>
  );
}

SearchPagePagination.propTypes = {
  query: PropTypes.string.isRequired,
  currentPage: PropTypes.number.isRequired,
  maxPage: PropTypes.number.isRequired,
};

function PageList({ children }) {
  return (
    <nav css={containerStyles} aria-label="Pagination">
      <ul css={listStyles}>{children}</ul>
    </nav>
  );
}

const containerStyles = css`
  margin: ${rhythm(1)} 0;
  ${scale(0, 1)}
`;

const listStyles = css`
  margin: 0 ${rhythm(0, -0.5)};
  padding: 0;

  list-style-type: none;

  display: flex;
  justify-content: center;
`;

function PageItem({ query, page, label, current, children }) {
  return (
    <li css={listItemStyles}>
      <Link
        css={listItemLinkStyles}
        to={`/search?q=${encodeURIComponent(query)}&p=${page}`}
        aria-label={label}
        aria-current={current ? "page" : null}
      >
        {children}
      </Link>
    </li>
  );
}

const listItemStyles = css`
  margin: 0 ${rhythm(0, 0.5)};
`;

const listItemLinkStyles = css`
  color: ${color(primaryColor, 7)};
  text-decoration: none;
`;

function PageItemIcon({ icon: Icon }) {
  return <Icon css={listItemIconStyles} size="1em" />;
}

const listItemIconStyles = css`
  vertical-align: middle;
`;
