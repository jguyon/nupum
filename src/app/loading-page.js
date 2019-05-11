import React from "react";
import { css, keyframes } from "@emotion/core";
import { hideVisually } from "polished";
import LoaderIcon from "react-feather/dist/icons/loader";
import { rhythm, color } from "./theme";

export default function LoadingPage() {
  return (
    <>
      <div css={loadingStyles}>
        <LoaderIcon css={loadingIconStyles} aria-hidden />
        <p css={hideVisually}>Loading&hellip;</p>
      </div>
    </>
  );
}

const loadingStyles = css`
  text-align: center;
  margin: ${rhythm(1)} 0;
`;

const rotateAnimation = keyframes`
  from {
    transform: rotate(0turn);
  }
  to {
    transform: rotate(1turn);
  }
`;

const loadingIconStyles = css`
  color: ${color("gray", 5)};
  width: ${rhythm(2)};
  height: ${rhythm(2)};

  animation: ${rotateAnimation} 2s linear infinite;
`;
