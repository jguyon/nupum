import React from "react";
import { css } from "@emotion/core";
import PropTypes from "prop-types";
import millify from "millify";
import {
  rhythm,
  scale,
  color,
  compactLineHeight,
  monoFontFamily,
} from "../theme";
import PackagePageUser from "./package-page-user";
import PackageBrowserSize from "./package-browser-size";

export default function PackagePageSideInfo({
  name,
  version,
  license,
  dependenciesCount,
  peerDependenciesCount,
  npmDownloadsLastMonthCount,
  npmDependentsCount,
  githubStarsCount,
  githubOpenIssuesCount,
  githubCommitsLast3MonthsCount,
  releasesLast3MonthsCount,
  maintainers,
}) {
  const usage = (
    <Section>
      <Heading>Usage</Heading>
      <Command>npm i {name}</Command>
      <Command>yarn add {name}</Command>
      <DList>
        <DListTitle>License</DListTitle>
        <DListDescription>{license ? license : "N/A"}</DListDescription>
        <DListTitle>Dependencies</DListTitle>
        <DListDescription>{dependenciesCount}</DListDescription>
        {peerDependenciesCount > 0 ? (
          <>
            <DListTitle>Peer dependencies</DListTitle>
            <DListDescription>{peerDependenciesCount}</DListDescription>
          </>
        ) : null}
        <DListTitle>Size in browser</DListTitle>
        <DListDescription>
          <PackageBrowserSize name={name} version={version} />
        </DListDescription>
      </DList>
    </Section>
  );

  const popularity = (
    <Section>
      <Heading>Popularity</Heading>
      <DList>
        {npmDownloadsLastMonthCount ? (
          <>
            <DListTitle>Downloads last month</DListTitle>
            <DListDescription>
              {millify(npmDownloadsLastMonthCount, { precision: 1 })}
            </DListDescription>
          </>
        ) : null}
        {githubStarsCount ? (
          <>
            <DListTitle>GitHub stars</DListTitle>
            <DListDescription>
              {millify(githubStarsCount, { precision: 1 })}
            </DListDescription>
          </>
        ) : null}
        <DListTitle>Dependents</DListTitle>
        <DListDescription>
          {millify(npmDependentsCount, { precision: 1 })}
        </DListDescription>
      </DList>
    </Section>
  );

  const activity =
    releasesLast3MonthsCount ||
    githubCommitsLast3MonthsCount ||
    githubOpenIssuesCount ? (
      <Section>
        <Heading>Activity</Heading>
        <DList>
          {releasesLast3MonthsCount ? (
            <>
              <DListTitle>Releases last 3 months</DListTitle>
              <DListDescription>
                {millify(releasesLast3MonthsCount, { precision: 1 })}
              </DListDescription>
            </>
          ) : null}
          {githubCommitsLast3MonthsCount ? (
            <>
              <DListTitle>Commits last 3 months</DListTitle>
              <DListDescription>
                {millify(githubCommitsLast3MonthsCount, { precision: 1 })}
              </DListDescription>
            </>
          ) : null}
          {githubOpenIssuesCount ? (
            <>
              <DListTitle>Open issues</DListTitle>
              <DListDescription>
                {millify(githubOpenIssuesCount, { precision: 1 })}
              </DListDescription>
            </>
          ) : null}
        </DList>
      </Section>
    ) : null;

  const maintainersList = (
    <Section>
      <Heading>Maintainers</Heading>
      {maintainers.map(({ username, email }) => (
        <Maintainer key={username} username={username} email={email} />
      ))}
    </Section>
  );

  return (
    <>
      {usage}
      {popularity}
      {activity}
      {maintainersList}
    </>
  );
}

PackagePageSideInfo.propTypes = {
  name: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  license: PropTypes.string,
  dependenciesCount: PropTypes.number.isRequired,
  peerDependenciesCount: PropTypes.number.isRequired,
  npmDownloadsLastMonthCount: PropTypes.number,
  npmDependentsCount: PropTypes.number.isRequired,
  githubStarsCount: PropTypes.number,
  githubCommitsLast3MonthsCount: PropTypes.number,
  githubOpenIssuesCount: PropTypes.number,
  releasesLast3MonthsCount: PropTypes.number,
  maintainers: PropTypes.arrayOf(
    PropTypes.shape({
      username: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
};

function Section({ children }) {
  return <article css={sectionStyles}>{children}</article>;
}

const sectionStyles = css`
  margin-bottom: ${rhythm(1)};
`;

function Heading({ children }) {
  return <h3 css={headingStyles}>{children}</h3>;
}

const headingStyles = css`
  ${scale(0, 2)}
  color: ${color("gray", 8)};
  margin: 0;
`;

function Command({ children }) {
  return (
    <div css={commandStyles}>
      <code css={commandCodeStyles}>$ {children}</code>
    </div>
  );
}

const commandStyles = css`
  display: flex;
  align-items: center;
  height: ${rhythm(1, 1)};
  padding: 0 ${rhythm(0, 1)};
  margin: ${rhythm(0, 1)} 0;

  background-color: ${color("gray", 0)};
  color: ${color("gray", 7)};
  border: 1px solid ${color("gray", 5)};
  border-radius: 3px;
`;

const commandCodeStyles = css`
  ${scale(0, -1, compactLineHeight)}
  font-family: ${monoFontFamily};

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

function DList({ children }) {
  return <dl css={dListStyles}>{children}</dl>;
}

const dListStyles = css`
  margin: 0;
`;

function DListTitle({ children }) {
  return <dt css={dListTitleStyles}>{children}</dt>;
}

const dListTitleStyles = css`
  float: left;
`;

function DListDescription({ children }) {
  return <dd css={dListDescriptionStyles}>{children}</dd>;
}

const dListDescriptionStyles = css`
  margin: 0;

  text-align: right;
  font-weight: bold;
  color: ${color("gray", 8)};
`;

function Maintainer({ username, email }) {
  return (
    <div css={maintainerStyles}>
      <PackagePageUser username={username} email={email} />
    </div>
  );
}

const maintainerStyles = css`
  ${scale(0, 0, 1)}
  margin: ${rhythm(0, 1)} 0;
`;
