import React from "react";
import PropTypes from "prop-types";
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
            maintainers={metadata.maintainers}
          />
        </PackagePageContentAside>

        <PackagePageContentMain>
          <PackagePageReadme contents={metadata.readme} />
        </PackagePageContentMain>
      </PackagePageContentRow>
    </>
  );
}

PackagePage.propTypes = {
  packageInfo: PropTypes.object.isRequired,
};
