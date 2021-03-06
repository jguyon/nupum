import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet-async";
import PackagePageBanner from "./package-page-banner";
import {
  PackagePageContentRow,
  PackagePageContentMain,
  PackagePageContentAside,
} from "./package-page-content";
import PackagePageSideInfo from "./package-page-side-info";
import PackagePageReadme from "./package-page-readme";

export default function PackagePage({
  packageInfo: { metadata, npm, github },
}) {
  return (
    <>
      <Helmet>
        <title>{metadata.name} | nupum</title>
      </Helmet>

      <PackagePageBanner
        name={metadata.name}
        version={metadata.version}
        description={metadata.description}
        keywords={metadata.keywords}
        date={new Date(metadata.date)}
        publisher={metadata.publisher}
        links={metadata.links}
      />

      <PackagePageContentRow>
        <PackagePageContentAside>
          <PackagePageSideInfo
            name={metadata.name}
            version={metadata.version}
            license={metadata.license}
            dependenciesCount={
              metadata.dependencies
                ? Object.keys(metadata.dependencies).length
                : 0
            }
            peerDependenciesCount={
              metadata.peerDependencies
                ? Object.keys(metadata.peerDependencies).length
                : 0
            }
            npmDownloadsLastMonthCount={
              npm.downloads.length > 2 ? npm.downloads[2].count : null
            }
            npmDependentsCount={npm.dependentsCount}
            githubStarsCount={github ? github.starsCount : 0}
            githubCommitsLast3MonthsCount={
              github && github.commits.length > 2
                ? github.commits[2].count
                : null
            }
            githubOpenIssuesCount={github ? github.issues.openCount : null}
            releasesLast3MonthsCount={
              metadata.releases.length > 1 ? metadata.releases[1].count : null
            }
            maintainers={metadata.maintainers}
          />
        </PackagePageContentAside>

        <PackagePageContentMain label="Readme file">
          <PackagePageReadme
            repository={metadata.links.repository}
            contents={metadata.readme}
          />
        </PackagePageContentMain>
      </PackagePageContentRow>
    </>
  );
}

PackagePage.propTypes = {
  packageInfo: PropTypes.object.isRequired,
};
