import React from "react";
import PropTypes from "prop-types";
import warning from "tiny-warning";
import { useNavigate, usePreload } from "./router";

export default function Link({
  to,
  replace,
  state,
  onClick,
  onMouseEnter,
  children,
  ...props
}) {
  warning(to[0] === "/", `expected "to" prop to be an absolute path`);

  const navigate = useNavigate();
  const preload = usePreload();

  function onLinkClick(event) {
    if (onClick) {
      onClick(event);
    }
    if (!event.defaultPrevented) {
      event.preventDefault();
      navigate(to, { replace, state });
    }
  }

  function onLinkMouseEnter(event) {
    if (onMouseEnter) {
      onMouseEnter(event);
    }
    if (!event.defaultPrevented) {
      preload(to, { state });
    }
  }

  return (
    <a
      {...props}
      href={to}
      onClick={onLinkClick}
      onMouseEnter={onLinkMouseEnter}
    >
      {children}
    </a>
  );
}

Link.propTypes = {
  to: PropTypes.string.isRequired,
  replace: PropTypes.bool,
  state: PropTypes.any,
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  children: PropTypes.node,
};
