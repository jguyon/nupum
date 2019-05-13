import React from "react";
import { createMemoryHistory } from "history";
import { renderWithContext, fireEvent, act } from "../../test/react";
import SearchForm, { SearchFormProvider } from ".";

const INPUT_LABEL = "Search query";
const SUBMIT_LABEL = "Search";

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

test("submitting navigates to search page", () => {
  const { history, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  fireEvent.change(getByLabelText(INPUT_LABEL), { target: { value: "react" } });
  fireEvent.click(getByLabelText(SUBMIT_LABEL));

  expect(history.location.pathname).toBe("/search");
  expect(history.location.search).toBe("?q=react");
});
