import { forwardRef } from "react";
import { jsx, css } from "@emotion/core";
import PropTypes from "prop-types";
import { rhythm } from "./theme";

export default forwardRef(Container);

function Container({ tag = "div", children, ...props }, ref) {
  return jsx(tag, { ref, css: containerStyles, ...props }, children);
}

Container.propTypes = {
  tag: PropTypes.string,
};

const containerStyles = css`
  max-width: ${rhythm(40)};
  padding: 0 ${rhythm(1)};
  margin: 0 auto;
`;
