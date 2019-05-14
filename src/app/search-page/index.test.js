import React from "react";
import { createLocation } from "history";
import { renderWithContext } from "../../test/react";
import { fakePackageSearch } from "../../test/fake";
import searchPage from "./search-page-module";
import { packageSearch } from "../../resources";
import SearchPage from ".";

const RESULTS_PER_PAGE = 10;
const LOADING_TEXT = "Loading…";
const ERROR_TEXT = "Could not fetch the search results.";
const SEARCH_RESULT_HEADING_TEST_ID = "search-result-heading";

// stub console.error until `act(...)` warnings can be fixed
// https://github.com/facebook/react/issues/14769
const consoleError = jest.spyOn(console, "error");
consoleError.mockImplementation(() => {});

test("search results are rendered when fetching succeeds", async () => {
  const {
    moduleCache,
    resourceCache,
    getByText,
    queryAllByTestId,
  } = renderWithContext(
    <SearchPage location={createLocation("/search?q=react")} />,
  );

  expect(() => getByText(LOADING_TEXT)).not.toThrow();

  await moduleCache.wait(searchPage);
  const searchResults = fakePackageSearch({ size: RESULTS_PER_PAGE });
  resourceCache.succeed(
    packageSearch,
    { query: "react", from: 0, size: RESULTS_PER_PAGE },
    searchResults,
  );

  expect(
    queryAllByTestId(SEARCH_RESULT_HEADING_TEST_ID).map(
      heading => heading.textContent,
    ),
  ).toEqual(
    searchResults.results.map(
      ({ package: { name, version } }) => `${name} ${version}`,
    ),
  );
});

test("error message is rendered when fetching module fails", () => {
  const { moduleCache, getByText } = renderWithContext(
    <SearchPage location={createLocation("/search?q=react")} />,
  );

  expect(() => getByText(LOADING_TEXT)).not.toThrow();

  moduleCache.fail(searchPage, new Error("fetching failed"));

  expect(() => getByText(ERROR_TEXT)).not.toThrow();
});

test("error message is rendered when fetching resource fails", () => {
  const { resourceCache, getByText } = renderWithContext(
    <SearchPage location={createLocation("/search?q=react")} />,
  );

  expect(() => getByText(LOADING_TEXT)).not.toThrow();

  resourceCache.fail(
    packageSearch,
    { query: "react", from: 0, size: RESULTS_PER_PAGE },
    new Error("fetching failed"),
  );

  expect(() => getByText(ERROR_TEXT)).not.toThrow();
});
