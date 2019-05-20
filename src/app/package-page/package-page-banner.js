import React from "react";
import { css } from "@emotion/core";
import PropTypes from "prop-types";
import TimeAgo from "react-timeago";
import TagIcon from "react-feather/dist/icons/tag";
import LinkIcon from "react-feather/dist/icons/link";
import HomeIcon from "react-feather/dist/icons/home";
import GitIcon from "react-feather/dist/icons/git-branch";
import { Link } from "../../router";
import { rhythm, scale, color, primaryColor } from "../theme";
import Banner from "../banner";
import PackagePageUser from "./package-page-user";

export default function PackagePageBanner({
  name,
  version,
  description,
  keywords,
  date,
  publisher,
  links,
}) {
  return (
    <Banner>
      <div css={rowStyles}>
        <div css={mainColumnStyles}>
          <Heading name={name} version={version} />

          {description && <Description text={description} />}

          {keywords && keywords.length > 0 && <KeywordList list={keywords} />}

          <Publication
            date={date}
            username={publisher.username}
            email={publisher.email}
          />
        </div>

        <div css={asideColumnStyles}>
          <LinkList>
            {links.npm && (
              <LinkListItem label="NPM page" icon={LinkIcon} url={links.npm} />
            )}

            {links.homepage && (
              <LinkListItem
                label="Homepage"
                icon={HomeIcon}
                url={links.homepage}
              />
            )}

            {links.repository && (
              <LinkListItem
                label="Repository"
                icon={GitIcon}
                url={links.repository}
              />
            )}
          </LinkList>
        </div>
      </div>
    </Banner>
  );
}

PackagePageBanner.propTypes = {
  name: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  description: PropTypes.string,
  keywords: PropTypes.arrayOf(PropTypes.string),
  date: PropTypes.instanceOf(Date).isRequired,
  publisher: PropTypes.shape({
    username: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  links: PropTypes.objectOf(PropTypes.string).isRequired,
};

const rowBreakpoint = "@media (min-width: 45em)";

const rowStyles = css`
  ${rowBreakpoint} {
    display: flex;
  }
`;

const mainColumnStyles = css`
  ${rowBreakpoint} {
    flex-grow: 1;
  }
`;

const asideColumnStyles = css`
  margin: ${rhythm(0, 2)} 0 0 0;

  ${rowBreakpoint} {
    width: ${rhythm(10)};
    flex-shrink: 0;
    margin: 0 0 0 ${rhythm(0, 2)};
  }
`;

function Heading({ name, version }) {
  return (
    <h1 css={headingStyles} data-testid="package-heading">
      {name} <small css={versionStyles}>{version}</small>
    </h1>
  );
}

const headingStyles = css`
  ${scale(0, 3)}
  color: ${color("gray", 8)};
  margin: 0 0 ${rhythm(0, 1)} 0;
`;

const versionStyles = css`
  ${scale(0)}
  font-weight: normal;
  color: ${color("gray", 6)};
`;

function Description({ text }) {
  return <p css={descriptionStyles}>{text}</p>;
}

const descriptionStyles = css`
  ${scale(0, 1)}
  margin: 0 0 ${rhythm(0, 1)} 0;
`;

function KeywordList({ list }) {
  return (
    <div css={keywordListContainerStyles}>
      <TagIcon css={keywordListIconStyles} aria-hidden size="1em" />{" "}
      <ul css={keywordListStyles} aria-label="Keywords">
        {list.map(keyword => (
          <li key={keyword} css={keywordListItemStyles}>
            <Link
              css={keywordListItemLinkStyles}
              to={`/search?q=${encodeURIComponent(keyword)}`}
            >
              {keyword}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const keywordListContainerStyles = css`
  ${scale(0)}
  color: ${color("gray", 6)};
`;

const keywordListIconStyles = css`
  vertical-align: middle;
`;

const keywordListStyles = css`
  display: inline;
  margin: 0;
  padding: 0;
`;

const keywordListItemStyles = css`
  display: inline;

  li + &::before {
    content: ", ";
  }
`;

const keywordListItemLinkStyles = css`
  color: inherit;

  text-decoration: none;
  @supports (text-decoration: underline transparent) {
    text-decoration: underline transparent;
  }

  transition: text-decoration 0.15s ease-out;
  &:hover {
    text-decoration: underline;
  }

  &:focus {
    outline: 1px dotted currentColor;
  }
`;

function Publication({ date, email, username }) {
  return (
    <p css={publicationStyles}>
      published <TimeAgo date={date} /> by{" "}
      <PackagePageUser email={email} username={username} />
    </p>
  );
}

const publicationStyles = css`
  ${scale(0, 0, 1)}
  margin: 0;
  color: ${color("gray", 6)};
`;

function LinkList({ children }) {
  return (
    <ul css={linkListStyles} aria-label="Package links">
      {children}
    </ul>
  );
}

const linkListStyles = css`
  list-style-type: none;
  margin: 0;
  padding: 0;
`;

function LinkListItem({ label, icon: Icon, url }) {
  return (
    <li css={linkListItemStyles}>
      <Icon css={linkListItemIconStyles} size="1em" aria-hidden />{" "}
      <a css={linkListItemLinkStyles} href={url} aria-label={label}>
        {parseHostName(url)}
      </a>
    </li>
  );
}

const linkListItemStyles = css`
  height: ${rhythm(1, 1)};
  padding: 0 ${rhythm(0, 1)};
  margin-bottom: ${rhythm(0, 1)};

  display: flex;
  align-items: center;

  background-color: ${color("white")};
  border: 1px solid ${color("gray", 5)};
  border-radius: 3px;
`;

const linkListItemIconStyles = css`
  flex-shrink: 0;
  margin-right: ${rhythm(0, 1)};
`;

const linkListItemLinkStyles = css`
  overflow: hidden;
  text-overflow: ellipsis;

  color: ${color(primaryColor, 7)};

  text-decoration: none;
  @supports (text-decoration: underline transparent) {
    text-decoration: underline transparent;
  }

  transition: text-decoration 0.15s ease-out;
  &:hover {
    text-decoration: underline;
  }
`;

function parseHostName(link) {
  const { hostname } = new URL(link);

  const matches = hostname.match(/^www\.(.+)$/);
  if (matches) {
    return matches[1];
  } else {
    return hostname;
  }
}
