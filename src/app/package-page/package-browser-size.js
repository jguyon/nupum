import React, { useMemo } from "react";
import { css } from "@emotion/core";
import { hideVisually } from "polished";
import PropTypes from "prop-types";
import invariant from "tiny-invariant";
import millify from "millify";
import {
  useResource,
  RESOURCE_PENDING,
  RESOURCE_SUCCESS,
  RESOURCE_FAILURE,
} from "../../resource-cache";
import { packageBrowserSize } from "../../resources";

export default function PackageBrowserSize({ name, version }) {
  const result = useResource(
    packageBrowserSize,
    useMemo(() => ({ name, version }), [name, version]),
  );

  switch (result.status) {
    case RESOURCE_PENDING:
      return (
        <>
          <span css={browserSizeAccessibleTextStyles}>Loading</span>
          &hellip;
        </>
      );

    case RESOURCE_FAILURE:
      return "N/A";

    case RESOURCE_SUCCESS:
      return millify(result.data.gzip, {
        precision: 1,
        units: ["B", "KB", "MB", "GB"],
      });

    default:
      invariant(false, `invalid status ${result.status}`);
  }
}

PackageBrowserSize.propTypes = {
  name: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
};

const browserSizeAccessibleTextStyles = css`
  ${hideVisually()}
`;
