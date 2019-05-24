import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/core";
import { Helmet } from "react-helmet-async";
import ErrorIcon from "react-feather/dist/icons/x-circle";
import { useStatusCode } from "../router";
import { rhythm, scale, color } from "./theme";
import Container from "./container";

export default function ErrorPage({ code = 500, msg }) {
  useStatusCode(code);

  return (
    <>
      <Helmet>
        <title>{msg} | nupum</title>
      </Helmet>

      <Container>
        <p css={errorStyles}>
          <ErrorIcon css={errorIconStyles} size="1em" aria-hidden /> {msg}
        </p>
      </Container>
    </>
  );
}

const errorStyles = css`
  ${scale(0, 2)}
  text-align: center;
  margin: ${rhythm(2)} 0;
  color: ${color("red", 7)};
`;

const errorIconStyles = css`
  vertical-align: middle;
`;

ErrorPage.propTypes = {
  code: PropTypes.number,
  msg: PropTypes.string.isRequired,
};
