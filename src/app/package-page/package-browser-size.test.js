import React from "react";
import { renderWithContext, act } from "../../test/react";
import { fakePackageBrowserSize } from "../../test/fake";
import { packageBrowserSize } from "../../resources";
import PackageBrowserSize from "./package-browser-size";

test("loading indicator is rendered while request fetches", () => {
  const { container } = renderWithContext(
    <PackageBrowserSize name="react" version="16.8.6" />,
  );

  expect(container).toMatchSnapshot();
});

test("error indicator is rendered when request fails", () => {
  const { resourceCache, container } = renderWithContext(
    <PackageBrowserSize name="react" version="16.8.6" />,
  );

  act(() => {
    resourceCache.fail(packageBrowserSize, {
      name: "react",
      version: "16.8.6",
    });
  });

  expect(container).toMatchSnapshot();
});

test("browser size is rendered when request succeeds", () => {
  const { resourceCache, container } = renderWithContext(
    <PackageBrowserSize name="react" version="16.8.6" />,
  );

  act(() => {
    resourceCache.succeed(
      packageBrowserSize,
      { name: "react", version: "16.8.6" },
      fakePackageBrowserSize({ name: "react", version: "16.8.6" }),
    );
  });

  expect(container).toMatchSnapshot();
});
