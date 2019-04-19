import React from "react";
import { render } from "../test/react";
import App from ".";

test("content is rendered", () => {
  const { asFragment } = render(<App />);

  expect(asFragment()).toMatchSnapshot();
});
