import React from "react";
import { createLocation, createMemoryHistory } from "history";
import {
  renderWithContext,
  renderRoutesWithContext,
  fireEvent,
  act,
} from "../../test/react";
import { fakePackageSearch } from "../../test/fake";
import searchPage from "./search-page-module";
import { packageSearch } from "../../resources";
import SearchPage from ".";

const RESULTS_PER_PAGE = 10;
const LOADING_TEXT = "Loading…";
const ERROR_TEXT = "Could not fetch the search results.";
const SEARCH_RESULT_HEADING_TEST_ID = "search-result-heading";

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

  const searchResults = fakePackageSearch({ size: RESULTS_PER_PAGE });
  await act(async () => {
    await moduleCache.wait(searchPage);
    resourceCache.succeed(
      packageSearch,
      { query: "react", from: 0, size: RESULTS_PER_PAGE },
      searchResults,
    );
  });

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

  act(() => {
    moduleCache.fail(searchPage, new Error("fetching failed"));
  });

  expect(() => getByText(ERROR_TEXT)).not.toThrow();
});

test("error message is rendered when fetching resource fails", () => {
  const { resourceCache, getByText } = renderWithContext(
    <SearchPage location={createLocation("/search?q=react")} />,
  );

  expect(() => getByText(LOADING_TEXT)).not.toThrow();

  act(() => {
    resourceCache.fail(
      packageSearch,
      { query: "react", from: 0, size: RESULTS_PER_PAGE },
      new Error("fetching failed"),
    );
  });

  expect(() => getByText(ERROR_TEXT)).not.toThrow();
});

test("navigating to another page displays the page's search results", async () => {
  const history = createMemoryHistory({ initialEntries: ["/search?q=react"] });
  const {
    moduleCache,
    resourceCache,
    getByLabelText,
    queryAllByTestId,
  } = renderRoutesWithContext(
    [
      {
        path: "/search",
        render: ({ location }) => <SearchPage location={location} />,
      },
    ],
    { history },
  );

  await act(async () => {
    await moduleCache.wait(searchPage);
    resourceCache.succeed(
      packageSearch,
      { query: "react", from: 0, size: RESULTS_PER_PAGE },
      {
        ...fakePackageSearch({ size: RESULTS_PER_PAGE }),
        total: RESULTS_PER_PAGE * 2,
      },
    );
  });

  fireEvent.click(getByLabelText("Next page"));

  const searchResults = {
    ...fakePackageSearch({ size: RESULTS_PER_PAGE }),
    total: RESULTS_PER_PAGE * 2,
  };
  act(() => {
    resourceCache.succeed(
      packageSearch,
      { query: "react", from: RESULTS_PER_PAGE, size: RESULTS_PER_PAGE },
      searchResults,
    );
  });

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
