import React from "react";
import { css } from "@emotion/core";
import PropTypes from "prop-types";
import { stripUnit } from "polished";
import millify from "millify";
import TagIcon from "react-feather/dist/icons/tag";
import LinkIcon from "react-feather/dist/icons/link";
import HomeIcon from "react-feather/dist/icons/home";
import GitIcon from "react-feather/dist/icons/git-branch";
import TimeAgo from "react-timeago";
import Gravatar from "react-gravatar";
import { Link } from "../../router";
import {
  rhythm,
  scale,
  color,
  baseFontSize,
  monoFontFamily,
  primaryColor,
} from "../theme";
import Banner from "../banner";
import Container from "../container";

export default function PackagePage({
  packageInfo: {
    collected: { metadata, npm, github },
  },
}) {
  return (
    <>
      <Banner>
        <div css={bannerRowStyles}>
          <div css={bannerMainColumnStyles}>
            <h2 css={headingStyles}>
              {metadata.name}{" "}
              <small css={versionStyles}>{metadata.version}</small>
            </h2>

            {metadata.description ? (
              <p css={descriptionStyles}>{metadata.description}</p>
            ) : null}

            {metadata.keywords && metadata.keywords.length > 0 ? (
              <div css={keywordsStyles}>
                <TagIcon css={keywordsIconStyles} aria-hidden size="1em" />{" "}
                <ul css={keywordsListStyles} aria-label="Keywords">
                  {metadata.keywords.map(keyword => (
                    <li key={keyword} css={keywordStyles}>
                      <Link
                        css={keywordLinkStyles}
                        to={`/search?q=${encodeURIComponent(keyword)}`}
                      >
                        {keyword}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p css={publicationStyles}>
              published <TimeAgo date={metadata.date} /> by{" "}
              <span css={avatarStyles}>
                <Gravatar size={avatarSize} email={metadata.publisher.email} />
              </span>{" "}
              <a
                css={userLinkStyles}
                href={`https://www.npmjs.com/~${metadata.publisher.username}`}
              >
                {metadata.publisher.username}
              </a>
            </p>
          </div>

          <div css={bannerAsideColumnStyles}>
            <ul css={linksListStyles} aria-label="Package links">
              <li css={linksListItemStyles}>
                <LinkIcon
                  css={linksListItemIconStyles}
                  size="1em"
                  aria-hidden
                />{" "}
                <a
                  css={linksListItemLinkStyles}
                  href={metadata.links.npm}
                  aria-label="NPM page"
                >
                  {parseHostName(metadata.links.npm)}
                </a>
              </li>
              {metadata.links.homepage ? (
                <li css={linksListItemStyles}>
                  <HomeIcon
                    css={linksListItemIconStyles}
                    size="1em"
                    aria-hidden
                  />{" "}
                  <a
                    css={linksListItemLinkStyles}
                    href={metadata.links.homepage}
                    aria-label="Homepage"
                  >
                    {parseHostName(metadata.links.homepage)}
                  </a>
                </li>
              ) : null}
              {metadata.links.repository ? (
                <li css={linksListItemStyles}>
                  <GitIcon
                    css={linksListItemIconStyles}
                    size="1em"
                    aria-hidden
                  />
                  <a
                    css={linksListItemLinkStyles}
                    href={metadata.links.repository}
                    aria-label="Repository"
                  >
                    {parseHostName(metadata.links.repository)}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </Banner>

      <Container>
        <div css={contentRowStyles}>
          <aside css={contentAsideColumnStyles}>
            <article css={asideSectionStyles}>
              <h3 css={asideHeadingStyles}>Usage</h3>
              <code css={asideCodeStyles}>$ npm install {metadata.name}</code>
              <code css={asideCodeStyles}>$ yarn add {metadata.name}</code>
              <dl css={asideDescListStyles}>
                <dt css={asideDescListTitleStyles}>Dependencies</dt>
                <dd css={asideDescListDescStyles}>
                  {metadata.dependencies
                    ? Object.keys(metadata.dependencies).length
                    : 0}
                </dd>
              </dl>
            </article>

            <article css={asideSectionStyles}>
              <h3 css={asideHeadingStyles}>Popularity</h3>
              <dl css={asideDescListStyles}>
                {npm.downloads.length >= 3 ? (
                  <>
                    <dt css={asideDescListTitleStyles}>Downloads last month</dt>
                    <dd css={asideDescListDescStyles}>
                      {millify(npm.downloads[2].count, { precision: 1 })}
                    </dd>
                  </>
                ) : null}
                {github ? (
                  <>
                    <dt css={asideDescListTitleStyles}>GitHub stars</dt>
                    <dd css={asideDescListDescStyles}>
                      {millify(github.starsCount, { precision: 1 })}
                    </dd>
                  </>
                ) : null}
                <dt css={asideDescListTitleStyles}>Dependents</dt>
                <dd css={asideDescListDescStyles}>
                  {millify(npm.dependentsCount, { precision: 1 })}
                </dd>
              </dl>
            </article>

            {github ? (
              <article css={asideSectionStyles}>
                <h3 css={asideHeadingStyles}>Activity</h3>
                <dl css={asideDescListStyles}>
                  {github.commits.length >= 3 ? (
                    <>
                      <dt css={asideDescListTitleStyles}>
                        Commits last 3 months
                      </dt>
                      <dd css={asideDescListDescStyles}>
                        {millify(github.commits[2].count, { precision: 1 })}
                      </dd>
                    </>
                  ) : null}
                  <dt css={asideDescListTitleStyles}>Open issues</dt>
                  <dd css={asideDescListDescStyles}>
                    {millify(github.issues.openCount, { precision: 1 })}
                  </dd>
                </dl>
              </article>
            ) : null}

            <article css={asideSectionStyles}>
              <h3 css={asideHeadingStyles}>Maintainers</h3>
              {metadata.maintainers.map(({ username, email }) => (
                <div key={username} css={asideMaintainerStyles}>
                  <span css={avatarStyles}>
                    <Gravatar size={avatarSize} email={email} />
                  </span>{" "}
                  <a
                    css={userLinkStyles}
                    href={`https://www.npmjs.com/~${username}`}
                  >
                    {username}
                  </a>
                </div>
              ))}
            </article>
          </aside>

          <section css={contentMainColumnStyles}>
            {metadata.readme ? (
              <pre css={readmeStyles}>{metadata.readme}</pre>
            ) : (
              <p css={noReadmeStyles}>This package has no readme.</p>
            )}
          </section>
        </div>
      </Container>
    </>
  );
}

PackagePage.propTypes = {
  packageInfo: PropTypes.object.isRequired,
};

function parseHostName(link) {
  const { hostname } = new URL(link);

  const matches = hostname.match(/^www\.(.+)$/);
  if (matches) {
    return matches[1];
  } else {
    return hostname;
  }
}

const bannerRowBreakpoint = "@media (min-width: 45em)";

const bannerRowStyles = css`
  ${bannerRowBreakpoint} {
    display: flex;
  }
`;

const bannerMainColumnStyles = css`
  ${bannerRowBreakpoint} {
    flex-grow: 1;
  }
`;

const bannerAsideColumnStyles = css`
  margin: ${rhythm(0, 2)} 0 0 0;

  ${bannerRowBreakpoint} {
    width: ${rhythm(10)};
    flex-shrink: 0;
    margin: 0 0 0 ${rhythm(0, 2)};
  }
`;

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

const descriptionStyles = css`
  ${scale(0, 1)}
  margin: 0 0 ${rhythm(0, 1)} 0;
`;

const keywordsStyles = css`
  ${scale(0)}
  color: ${color("gray", 6)};
`;

const keywordsIconStyles = css`
  vertical-align: middle;
`;

const keywordsListStyles = css`
  display: inline;
  margin: 0;
  padding: 0;
`;

const keywordLinkStyles = css`
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

const keywordStyles = css`
  display: inline;

  li + &::before {
    content: ", ";
  }
`;

const publicationStyles = css`
  ${scale(0, 0, 1)}
  margin: 0;
  color: ${color("gray", 6)};
`;

const avatarStyles = css`
  display: inline-block;
  vertical-align: middle;

  border-radius: 50%;
  overflow: hidden;

  width: ${rhythm(1, 1)};
  height: ${rhythm(1, 1)};

  border: 2px solid ${color("gray", 8)};
`;

const avatarSize = (() => {
  return stripUnit(rhythm(1, 1)) * baseFontSize - 4;
})();

const userLinkStyles = css`
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

const linksListStyles = css`
  list-style-type: none;
  margin: 0;
  padding: 0;
`;

const linksListItemStyles = css`
  height: ${rhythm(1, 1)};
  padding: 0 ${rhythm(0, 1)};
  margin-bottom: ${rhythm(0, 1)};

  display: flex;
  align-items: center;

  background-color: ${color("white")};
  border: 1px solid ${color("gray", 5)};
  border-radius: 3px;
`;

const linksListItemIconStyles = css`
  flex-shrink: 0;
  margin-right: ${rhythm(0, 1)};
`;

const linksListItemLinkStyles = css`
  overflow: hidden;
  text-overflow: ellipsis;

  color: ${color(primaryColor, 8)};
  text-decoration: underline transparent;

  transition: text-decoration 0.15s ease-out;
  &:hover {
    text-decoration: underline;
  }
`;

const contentRowBreakpoint = "@media (min-width: 52em)";

const contentRowStyles = css`
  margin: ${rhythm(1)} 0;

  ${contentRowBreakpoint} {
    display: flex;
    align-items: flex-start;
  }
`;

const contentMainColumnStyles = css`
  border-top: 1px solid ${color("gray", 3)};
  padding-top: calc(${rhythm(1)} - 1px);

  ${contentRowBreakpoint} {
    border-top: 0;
    padding-top: 0;

    order: 1;
    flex-grow: 1;
  }
`;

const contentAsideColumnStyles = css`
  ${contentRowBreakpoint} {
    width: ${rhythm(10, 2)};
    margin-left: ${rhythm(0, 2)};
    border-left: 1px solid ${color("gray", 3)};
    padding-left: calc(${rhythm(0, 2)} - 1px);

    order: 2;
    flex-shrink: 0;
  }
`;

const asideSectionStyles = css`
  margin-bottom: ${rhythm(1)};
`;

const asideHeadingStyles = css`
  ${scale(0, 2)}
  color: ${color("gray", 8)};
  margin: 0;
`;

const asideCodeStyles = css`
  display: flex;
  align-items: center;
  height: ${rhythm(1, 1)};
  padding: 0 ${rhythm(0, 1)};
  margin: ${rhythm(0, 1)} 0;

  font-family: ${monoFontFamily};
  background-color: ${color("gray", 0)};
  color: ${color("gray", 7)};
  border: 1px solid ${color("gray", 5)};
  border-radius: 3px;
`;

const asideDescListStyles = css`
  margin: 0;
`;

const asideDescListTitleStyles = css`
  float: left;
`;

const asideDescListDescStyles = css`
  margin: 0;

  text-align: right;
  font-weight: bold;
  color: ${color("gray", 8)};
`;

const asideMaintainerStyles = css`
  ${scale(0, 0, 1)}
  margin: ${rhythm(0, 1)} 0;
`;

const noReadmeStyles = css`
  margin: 0;
`;

const readmeStyles = css`
  font-family: ${monoFontFamily};
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
`;
