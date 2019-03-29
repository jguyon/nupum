import React, { StrictMode } from "react";
import { render as rtlRender, cleanup } from "react-testing-library";
import "jest-dom/extend-expect";
import serializer from "jest-emotion";

expect.addSnapshotSerializer(serializer);

afterEach(() => {
  cleanup();
});

export * from "react-testing-library";

export function render(ui, options) {
  const { rerender: rtlRerender, ...rest } = rtlRender(wrapUi(ui));

  function rerender(nextUi) {
    rtlRerender(wrapUi(nextUi));
  }

  return {
    ...rest,
    rerender,
  };
}

function wrapUi(ui) {
  return <StrictMode>{ui}</StrictMode>;
}
