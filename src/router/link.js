import React, { useState } from "react";
import PropTypes from "prop-types";
import warning from "tiny-warning";
import { useNavigate, usePreload } from "./router";

export default function Link({
  to,
  replace,
  state,
  onClick,
  onMouseMove,
  children,
  ...props
}) {
  warning(to[0] === "/", `expected "to" prop to be an absolute path`);

  const navigate = useNavigate();
  const preload = usePreload();
  const [hasPreloaded, setHasPreloaded] = useState(false);

  function onLinkClick(event) {
    if (onClick) {
      onClick(event);
    }
    if (!event.defaultPrevented) {
      event.preventDefault();
      navigate(to, { replace, state });
    }
  }

  function onLinkMouseMove(event) {
    if (onMouseMove) {
      onMouseMove(event);
    }
    if (!event.defaultPrevented && !hasPreloaded) {
      setHasPreloaded(true);
      preload(to, { state });
    }
  }

  return (
    <a {...props} href={to} onClick={onLinkClick} onMouseMove={onLinkMouseMove}>
      {children}
    </a>
  );
}

Link.propTypes = {
  to: PropTypes.string.isRequired,
  replace: PropTypes.bool,
  state: PropTypes.any,
  onClick: PropTypes.func,
  onMouseMove: PropTypes.func,
  children: PropTypes.node,
};
