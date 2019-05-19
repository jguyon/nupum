import React from "react";
import { css } from "@emotion/core";
import PropTypes from "prop-types";
import { stripUnit } from "polished";
import Gravatar from "react-gravatar";
import { rhythm, color, baseFontSize } from "../theme";

export default function PackagePageUser({ username, email }) {
  return (
    <>
      <span css={avatarStyles}>
        <Gravatar email={email} size={avatarSize} />
      </span>{" "}
      <a css={linkStyles} href={`https://www.npmjs.com/~${username}`}>
        {username}
      </a>
    </>
  );
}

PackagePageUser.propTypes = {
  username: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
};

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

const linkStyles = css`
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
