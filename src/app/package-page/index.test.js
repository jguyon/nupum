import React from "react";
import { renderWithContext, act } from "../../test/react";
import { fakePackageInfo } from "../../test/fake";
import packagePage from "./package-page-module";
import { packageInfo } from "../../resources";
import PackagePage from ".";

const NOT_FOUND_TEXT = "Page not found";
const ERROR_TEXT = "Could not fetch the package information";
const PACKAGE_HEADING_TEST_ID = "package-heading";

function loadingText(packageName) {
  return `Loading ${packageName} package…`;
}

test("package information is rendered when fetching succeeds", async () => {
  const data = fakePackageInfo();
  const {
    moduleCache,
    resourceCache,
    getByText,
    getByTestId,
  } = renderWithContext(<PackagePage name={data.collected.metadata.name} />);

  expect(() =>
    getByText(loadingText(data.collected.metadata.name)),
  ).not.toThrow();

  await act(async () => {
    await moduleCache.wait(packagePage);
    resourceCache.succeed(packageInfo, data.collected.metadata.name, {
      found: true,
      data,
    });
  });

  expect(getByTestId(PACKAGE_HEADING_TEST_ID)).toHaveTextContent(
    `${data.collected.metadata.name} ${data.collected.metadata.version}`,
  );
});

test("404 is rendered when package was not found", async () => {
  const { moduleCache, resourceCache, getByText } = renderWithContext(
    <PackagePage name="react" />,
  );

  expect(() => getByText(loadingText("react"))).not.toThrow();

  await act(async () => {
    await moduleCache.wait(packagePage);
    resourceCache.succeed(packageInfo, "react", { found: false });
  });

  expect(() => getByText(NOT_FOUND_TEXT)).not.toThrow();
});

test("error message is rendered when fetching module fails", () => {
  const { moduleCache, getByText } = renderWithContext(
    <PackagePage name="react" />,
  );

  expect(() => getByText(loadingText("react"))).not.toThrow();

  act(() => {
    moduleCache.fail(packagePage, new Error("fetching failed"));
  });

  expect(() => getByText(ERROR_TEXT)).not.toThrow();
});

test("error message is rendered when fetching resource fails", () => {
  const { resourceCache, getByText } = renderWithContext(
    <PackagePage name="react" />,
  );

  expect(() => getByText(loadingText("react"))).not.toThrow();

  act(() => {
    resourceCache.fail(packageInfo, "react", new Error("fetching failed"));
  });

  expect(() => getByText(ERROR_TEXT)).not.toThrow();
});
