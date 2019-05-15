import React from "react";
import { css } from "@emotion/core";
import PropTypes from "prop-types";
import { stripUnit } from "polished";
import TimeAgo from "react-timeago";
import Gravatar from "react-gravatar";
import LinkIcon from "react-feather/dist/icons/link";
import HomeIcon from "react-feather/dist/icons/home";
import GitIcon from "react-feather/dist/icons/git-branch";
import TagIcon from "react-feather/dist/icons/tag";
import { Link } from "../../router";
import { rhythm, scale, color, primaryColor, baseFontSize } from "../theme";

export default function SearchPageResult({
  name,
  version,
  links,
  description,
  keywords,
  date,
  publisher,
}) {
  return (
    <article css={containerStyles}>
      <header>
        <Heading name={name} version={version} />

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
      </header>

      {description && <Description text={description} />}

      {keywords && keywords.length > 0 && <KeywordList list={keywords} />}

      <Publication
        date={date}
        email={publisher.email}
        username={publisher.username}
      />
    </article>
  );
}

SearchPageResult.propTypes = {
  name: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  links: PropTypes.objectOf(PropTypes.string).isRequired,
  description: PropTypes.string,
  keywords: PropTypes.arrayOf(PropTypes.string.isRequired),
  date: PropTypes.instanceOf(Date).isRequired,
  publisher: PropTypes.shape({
    email: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }).isRequired,
};

const containerStyles = css`
  margin: ${rhythm(1)} 0;
`;

function Heading({ name, version }) {
  return (
    <h3 css={headingStyles} data-testid="search-result-heading">
      <Link css={headingNameStyles} to={`/package/${name}`} preloadOnHover>
        {name}
      </Link>{" "}
      <small css={headingVersionStyles}>{version}</small>
    </h3>
  );
}

const headingStyles = css`
  ${scale(0, 2)}
  display: inline-block;
  margin: 0;
`;

const headingNameStyles = css`
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

const headingVersionStyles = css`
  ${scale(0, -1)}
  font-weight: normal;
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
  display: inline-block;
  margin: 0;
  padding: 0;
`;

function LinkListItem({ url, label, icon: Icon }) {
  return (
    <li css={linkListItemStyles}>
      <a css={linkListItemLinkStyles} href={url} aria-label={label}>
        <Icon size="1em" />
      </a>
    </li>
  );
}

const linkListItemStyles = css`
  display: inline-block;
  margin-left: ${rhythm(0, 1)};
`;

const linkListItemLinkStyles = css`
  color: ${color("gray", 8)};

  &:focus {
    outline: 1px dotted currentColor;
  }
`;

function Description({ text }) {
  return <p css={descriptionStyles}>{text}</p>;
}

const descriptionStyles = css`
  margin: 0;
`;

function KeywordList({ list }) {
  return (
    <div css={keywordListContainerStyles}>
      <TagIcon css={keywordListIconStyles} aria-hidden size="1em" />{" "}
      <ul css={keywordListStyles} aria-label="Keywords">
        {list.map((keyword, i) => (
          <li key={i} css={keywordListItemStyles}>
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
  ${scale(0, -1)}
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
  text-decoration: underline transparent;

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
      <span css={publicationAvatarStyles}>
        <Gravatar email={email} size={publicationAvatarSize} />
      </span>{" "}
      <a
        css={publicationLinkStyles}
        href={`https://www.npmjs.com/~${username}`}
      >
        {username}
      </a>
    </p>
  );
}

const publicationStyles = css`
  ${scale(0, -1, 1)}
  margin: 0;
  color: ${color("gray", 6)};
`;

const publicationAvatarStyles = css`
  display: inline-block;
  vertical-align: middle;

  border-radius: 50%;
  overflow: hidden;

  width: ${rhythm(1)};
  height: ${rhythm(1)};

  border: 2px solid ${color("gray", 8)};
`;

const publicationAvatarSize = (() => {
  return stripUnit(rhythm(1)) * baseFontSize - 4;
})();

const publicationLinkStyles = css`
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
