import React from "react";
import { css } from "@emotion/core";
import PropTypes from "prop-types";
import { rhythm, scale, color, monoFontFamily } from "../theme";
import Banner from "../banner";
import Container from "../container";

export default function PackagePage({
  packageInfo: {
    collected: { metadata },
  },
}) {
  return (
    <>
      <Banner>
        <h2 css={headingStyles}>
          {metadata.name} <small css={versionStyles}>{metadata.version}</small>
        </h2>

        {metadata.description ? (
          <p css={descriptionStyles}>{metadata.description}</p>
        ) : null}
      </Banner>

      <Container>
        {metadata.readme ? (
          <pre css={readmeStyles}>{metadata.readme}</pre>
        ) : (
          <p css={noReadmeStyles}>This package has no readme.</p>
        )}
      </Container>
    </>
  );
}

PackagePage.propTypes = {
  packageInfo: PropTypes.object.isRequired,
};

const headingStyles = css`
  ${scale(0, 3)}
  margin: 0;
`;

const versionStyles = css`
  ${scale(0, -1)}
  font-weight: normal;
  color: ${color("gray", 7)};
`;

const descriptionStyles = css`
  margin: 0;
`;

const noReadmeStyles = css`
  margin: ${rhythm(1)} 0;
`;

const readmeStyles = css`
  font-family: ${monoFontFamily};
  white-space: pre-wrap;
  margin: ${rhythm(1)} 0;
`;
