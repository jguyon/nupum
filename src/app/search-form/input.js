import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

// This is a work around for SSR.
// Without this, if the user types in the input that has been server rendered
// before the component has been mounted, the value of the input and the value
// held in state will be out of sync.
export default function Input({ value, onChangeValue, ...props }) {
  const [isFirstRender, setIsFirstRender] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isFirstRender) {
      if (inputRef.current.value !== value) {
        onChangeValue(inputRef.current.value);
      }
      setIsFirstRender(false);
    }
  }, [isFirstRender, value, onChangeValue]);

  return (
    <input
      {...props}
      ref={inputRef}
      value={value}
      onChange={event => onChangeValue(event.target.value)}
    />
  );
}

Input.propTypes = {
  value: PropTypes.string.isRequired,
  onChangeValue: PropTypes.func.isRequired,
};
