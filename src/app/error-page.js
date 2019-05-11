import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/core";
import AlertIcon from "react-feather/dist/icons/alert-circle";
import { rhythm, scale, color } from "./theme";
import Container from "./container";

export default function ErrorPage({ msg }) {
  return (
    <Container>
      <p css={errorStyles}>
        <AlertIcon css={errorIconStyles} size="1em" aria-hidden /> {msg}
      </p>
    </Container>
  );
}

const errorStyles = css`
  ${scale(0, 1)}
  text-align: center;
  margin: ${rhythm(1)} 0;
  color: ${color("red", 7)};
`;

const errorIconStyles = css`
  vertical-align: middle;
`;

ErrorPage.propTypes = {
  msg: PropTypes.string.isRequired,
};
