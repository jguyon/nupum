import React from "react";
import { createMemoryHistory, createLocation } from "history";
import {
  renderWithContext,
  renderRoutesWithContext,
  fireEvent,
  act,
} from "../../test/react";
import SearchForm, { SearchFormProvider } from ".";

const INPUT_LABEL = "Search query";
const SUBMIT_LABEL = "Search";
const FORM_TEST_ID = "search-form";

test("input is initialized with empty value by default", () => {
  const { getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  expect(getByLabelText(INPUT_LABEL)).toHaveAttribute("value", "");
});

test("input is initialized with correct value when on search page", () => {
  const history = createMemoryHistory({ initialEntries: ["/search?q=react"] });
  const { getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
    { history },
  );

  expect(getByLabelText(INPUT_LABEL)).toHaveAttribute("value", "react");
});

test("input conserves its value when navigating", () => {
  const { history, getByLabelText, rerender, asFragment } = renderWithContext(
    <SearchFormProvider>
      <SearchForm key={1} />
    </SearchFormProvider>,
  );

  fireEvent.change(getByLabelText(INPUT_LABEL), { target: { value: "react" } });
  const fragmentBefore = asFragment();

  rerender(
    <SearchFormProvider>
      <SearchForm key={2} />
    </SearchFormProvider>,
  );

  expect(getByLabelText(INPUT_LABEL)).toHaveAttribute("value", "react");
  expect(fragmentBefore).toMatchDiffSnapshot(asFragment());

  act(() => {
    history.push("/search?q=react%20router");
  });

  expect(getByLabelText(INPUT_LABEL)).toHaveAttribute("value", "react");
  expect(fragmentBefore).toMatchDiffSnapshot(asFragment());
});

test("submitting navigates to search page with non-empty input", () => {
  const {
    history,
    getByLabelText,
    getByTestId,
    asFragment,
  } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );
  const fragmentBefore = asFragment();

  fireEvent.change(getByLabelText(INPUT_LABEL), { target: { value: "react" } });

  expect(getByLabelText(SUBMIT_LABEL)).toHaveAttribute(
    "aria-disabled",
    "false",
  );
  expect(fragmentBefore).toMatchDiffSnapshot(asFragment());

  fireEvent.submit(getByTestId(FORM_TEST_ID));

  expect(history.location.pathname).toBe("/search");
  expect(history.location.search).toBe("?q=react");
});

test("submitting does not navigate to search page with empty input", () => {
  const {
    history,
    getByLabelText,
    getByTestId,
    asFragment,
  } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  fireEvent.change(getByLabelText(INPUT_LABEL), { target: { value: "react" } });
  const fragmentBefore = asFragment();

  fireEvent.change(getByLabelText(INPUT_LABEL), { target: { value: "  " } });

  expect(getByLabelText(SUBMIT_LABEL)).toHaveAttribute("aria-disabled", "true");
  expect(fragmentBefore).toMatchDiffSnapshot(asFragment());

  fireEvent.submit(getByTestId(FORM_TEST_ID));

  expect(history.location.pathname).toBe("/");
  expect(history.location.search).toBe("");
});

test("hovering submit button preloads search page with non-empty input", () => {
  const preload = jest.fn(() => Promise.resolve());
  const { getByLabelText } = renderRoutesWithContext([
    {
      path: "/",
      render: () => (
        <SearchFormProvider>
          <SearchForm />
        </SearchFormProvider>
      ),
    },
    {
      path: "/search",
      preload,
      render: () => null,
    },
  ]);

  fireEvent.change(getByLabelText(INPUT_LABEL), { target: { value: "react" } });
  fireEvent.mouseEnter(getByLabelText(SUBMIT_LABEL));

  expect(preload).toHaveBeenCalledTimes(1);
  expect(preload).toHaveBeenCalledWith({
    action: "PRELOAD",
    location: createLocation("/search?q=react"),
    params: {},
  });
});

test("hovering submit button does not preload search page with empty input", () => {
  const preload = jest.fn(() => Promise.resolve());
  const { getByLabelText } = renderRoutesWithContext([
    {
      path: "/",
      render: () => (
        <SearchFormProvider>
          <SearchForm />
        </SearchFormProvider>
      ),
    },
    {
      path: "/search",
      preload,
      render: () => null,
    },
  ]);

  fireEvent.change(getByLabelText(INPUT_LABEL), { target: { value: "   " } });
  fireEvent.mouseEnter(getByLabelText(SUBMIT_LABEL));

  expect(preload).not.toHaveBeenCalled();
});
