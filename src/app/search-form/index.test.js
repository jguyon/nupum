import React from "react";
import { createMemoryHistory, createLocation } from "history";
import {
  renderWithContext,
  renderRoutesWithContext,
  fireEvent,
  act,
} from "../../test/react";
import { packageSuggestions } from "../../resources";
import { fakePackageSuggestions } from "../../test/fake";
import SearchForm, { SearchFormProvider } from ".";

const SUGGESTIONS_SIZE = 10;
const INPUT_LABEL = "Search query";
const SUGGESTIONS_LABEL = "Package suggestions";
const SUBMIT_LABEL = "Search";
const FORM_TEST_ID = "search-form";

test("input is initialized with empty value by default", () => {
  const { getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  expect(getByLabelText(INPUT_LABEL)).toHaveAttribute("value", "");
  expect();
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

test("menu is initialized as collapsed", () => {
  const history = createMemoryHistory({ initialEntries: ["/search?q=react"] });
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
    { history },
  );

  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      fakePackageSuggestions({ size: SUGGESTIONS_SIZE }),
    );
  });

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  expect(input).toHaveAttribute("aria-expanded", "false");
  expect(input).toMatchSnapshot();
  expect(menu).toHaveStyle("display: none");
  expect(menu).toMatchSnapshot();
});

test("changing input value expands menu when it is not expanded", () => {
  const history = createMemoryHistory({ initialEntries: ["/search?q=react"] });
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
    { history },
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "react router" } });

  const reactRouterSuggestions = fakePackageSuggestions({
    size: SUGGESTIONS_SIZE,
  });
  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react router", size: SUGGESTIONS_SIZE },
      reactRouterSuggestions,
    );
  });

  expect(input).toHaveAttribute("aria-expanded", "true");
  expect(input).toMatchSnapshot();
  expect(menu).not.toHaveStyle("display: none");
  reactRouterSuggestions.forEach(({ package: { name } }, i) => {
    expect(menu.children[i]).toHaveTextContent(name);
  });
  expect(menu).toMatchSnapshot();
});

test("pressing down arrow key expands menu when it is not expanded", () => {
  const history = createMemoryHistory({ initialEntries: ["/search?q=react"] });
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
    { history },
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.keyDown(input, { key: "ArrowDown" });

  const reactSuggestions = fakePackageSuggestions({ size: SUGGESTIONS_SIZE });
  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      reactSuggestions,
    );
  });

  expect(input).toHaveAttribute("aria-expanded", "true");
  expect(input).toMatchSnapshot();
  expect(menu).not.toHaveStyle("display: none");
  reactSuggestions.forEach(({ package: { name } }, i) => {
    expect(menu.children[i]).toHaveTextContent(name);
  });
  expect(menu).toMatchSnapshot();
});

test("pressing up arrow key expands menu when it is not expanded", () => {
  const history = createMemoryHistory({ initialEntries: ["/search?q=react"] });
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
    { history },
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.keyDown(input, { key: "ArrowUp" });

  const reactSuggestions = fakePackageSuggestions({ size: SUGGESTIONS_SIZE });
  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      reactSuggestions,
    );
  });

  expect(input).toHaveAttribute("aria-expanded", "true");
  expect(input).toMatchSnapshot();
  expect(menu).not.toHaveStyle("display: none");
  reactSuggestions.forEach(({ package: { name } }, i) => {
    expect(menu.children[i]).toHaveTextContent(name);
  });
  expect(menu).toMatchSnapshot();
});

test("menu does not expand when input is empty", () => {
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "  " } });

  expect(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "  ", size: SUGGESTIONS_SIZE },
      fakePackageSuggestions({ size: SUGGESTIONS_SIZE }),
    );
  }).toThrowErrorMatchingSnapshot();

  expect(input).toHaveAttribute("aria-expanded", "false");
  expect(input).toMatchSnapshot();
  expect(menu).toHaveStyle("display: none");
  expect(menu).toMatchSnapshot();
});

test("menu does not expand when there are no suggestions", () => {
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      [],
    );
  });

  expect(input).toHaveAttribute("aria-expanded", "false");
  expect(input).toMatchSnapshot();
  expect(menu).toHaveStyle("display: none");
  expect(menu).toMatchSnapshot();
});

test("changing input value updates suggestions when menu is expanded", () => {
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      fakePackageSuggestions({ size: SUGGESTIONS_SIZE }),
    );
  });

  fireEvent.change(input, { target: { value: "react router" } });

  const reactRouterSuggestions = fakePackageSuggestions({
    size: SUGGESTIONS_SIZE,
  });
  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react router", size: SUGGESTIONS_SIZE },
      reactRouterSuggestions,
    );
  });

  expect(input).toHaveAttribute("aria-expanded", "true");
  expect(input).toMatchSnapshot();
  reactRouterSuggestions.forEach(({ package: { name } }, i) => {
    expect(menu.children[i]).toHaveTextContent(name);
  });
  expect(menu).toMatchSnapshot();
});

test("menu keeps previous suggestions while next suggestions are fetching", () => {
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  const reactSuggestions = fakePackageSuggestions({
    size: SUGGESTIONS_SIZE,
  });
  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      reactSuggestions,
    );
  });

  fireEvent.change(input, { target: { value: "react router" } });

  expect(input).toHaveAttribute("aria-expanded", "true");
  expect(input).toMatchSnapshot();
  reactSuggestions.forEach(({ package: { name } }, i) => {
    expect(menu.children[i]).toHaveTextContent(name);
  });
  expect(menu).toMatchSnapshot();
});

test("menu keeps previous suggestions when fetching next suggestions fails", () => {
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  const reactSuggestions = fakePackageSuggestions({
    size: SUGGESTIONS_SIZE,
  });
  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      reactSuggestions,
    );
  });

  fireEvent.change(input, { target: { value: "react router" } });

  act(() => {
    resourceCache.fail(
      packageSuggestions,
      { query: "react router", size: SUGGESTIONS_SIZE },
      new Error("error fetching suggestions"),
    );
  });

  expect(input).toHaveAttribute("aria-expanded", "true");
  expect(input).toMatchSnapshot();
  reactSuggestions.forEach(({ package: { name } }, i) => {
    expect(menu.children[i]).toHaveTextContent(name);
  });
  expect(menu).toMatchSnapshot();
});

test("pressing down arrow key selects first suggestion when menu is expanded with no selected suggestion", () => {
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      fakePackageSuggestions({ size: SUGGESTIONS_SIZE }),
    );
  });

  fireEvent.keyDown(input, { key: "ArrowDown" });

  expect(input).toHaveAttribute("aria-activedescendant", menu.children[0].id);
  expect(input).toMatchSnapshot();
  expect(menu.children[0]).toHaveAttribute("aria-selected", "true");
  expect(menu).toMatchSnapshot();
});

test("pressing up arrow key selects last suggestion when menu is expanded with no selected suggestion", () => {
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      fakePackageSuggestions({ size: SUGGESTIONS_SIZE }),
    );
  });

  fireEvent.keyDown(input, { key: "ArrowUp" });

  const i = SUGGESTIONS_SIZE - 1;
  expect(input).toHaveAttribute("aria-activedescendant", menu.children[i].id);
  expect(input).toMatchSnapshot();
  expect(menu.children[i]).toHaveAttribute("aria-selected", "true");
  expect(menu).toMatchSnapshot();
});

test("pressing down arrow key selects next suggestion when a suggestion is selected", () => {
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      fakePackageSuggestions({ size: SUGGESTIONS_SIZE }),
    );
  });

  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "ArrowDown" });

  expect(input).toHaveAttribute("aria-activedescendant", menu.children[1].id);
  expect(input).toMatchSnapshot();
  expect(menu.children[1]).toHaveAttribute("aria-selected", "true");
  expect(menu).toMatchSnapshot();
});

test("pressing up arrow key selects previous suggestion when a suggestion is selected", () => {
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      fakePackageSuggestions({ size: SUGGESTIONS_SIZE }),
    );
  });

  fireEvent.keyDown(input, { key: "ArrowUp" });
  fireEvent.keyDown(input, { key: "ArrowUp" });

  const i = SUGGESTIONS_SIZE - 2;
  expect(input).toHaveAttribute("aria-activedescendant", menu.children[i].id);
  expect(input).toMatchSnapshot();
  expect(menu.children[i]).toHaveAttribute("aria-selected", "true");
  expect(menu).toMatchSnapshot();
});

test("pressing down arrow key unselects suggestion when last suggestion is selected", () => {
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      fakePackageSuggestions({ size: SUGGESTIONS_SIZE }),
    );
  });

  fireEvent.keyDown(input, { key: "ArrowUp" });
  fireEvent.keyDown(input, { key: "ArrowDown" });

  const i = SUGGESTIONS_SIZE - 1;
  expect(input).not.toHaveAttribute("aria-activedescendant");
  expect(input).toMatchSnapshot();
  expect(menu.children[i]).toHaveAttribute("aria-selected", "false");
  expect(menu).toMatchSnapshot();
});

test("pressing up arrow key unselects suggestion when first suggestion is selected", () => {
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      fakePackageSuggestions({ size: SUGGESTIONS_SIZE }),
    );
  });

  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "ArrowUp" });

  expect(input).not.toHaveAttribute("aria-activedescendant");
  expect(input).toMatchSnapshot();
  expect(menu.children[0]).toHaveAttribute("aria-selected", "false");
  expect(menu).toMatchSnapshot();
});

test("hovering a suggestion selects it", () => {
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      fakePackageSuggestions({ size: SUGGESTIONS_SIZE }),
    );
  });

  fireEvent.mouseMove(menu.children[1]);

  expect(input).toHaveAttribute("aria-activedescendant", menu.children[1].id);
  expect(input).toMatchSnapshot();
  expect(menu.children[1]).toHaveAttribute("aria-selected", "true");
  expect(menu).toMatchSnapshot();
});

test("changing input value when a suggestion is selected unselects it", () => {
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      fakePackageSuggestions({ size: SUGGESTIONS_SIZE }),
    );
  });

  fireEvent.change(input, "react router");

  expect(input).not.toHaveAttribute("aria-activedescendant");
  expect(input).toMatchSnapshot();
  expect(menu.children[0]).toHaveAttribute("aria-selected", "false");
  expect(menu).toMatchSnapshot();
});

test("suggestion selected before next suggestions are fetched is kept selected once they are fetched", () => {
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      fakePackageSuggestions({ size: SUGGESTIONS_SIZE }),
    );
  });

  fireEvent.change(input, { target: { value: "react router" } });
  fireEvent.mouseMove(menu.children[2]);

  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react router", size: SUGGESTIONS_SIZE },
      fakePackageSuggestions({ size: SUGGESTIONS_SIZE }),
    );
  });

  expect(input).toHaveAttribute("aria-activedescendant", menu.children[2].id);
  expect(input).toMatchSnapshot();
  expect(menu.children[2]).toHaveAttribute("aria-selected", "true");
  expect(menu).toMatchSnapshot();
});

for (const [key, name] of [
  ["ArrowLeft", "left arrow"],
  ["ArrowRight", "right arrow"],
  ["Home", "home"],
  ["End", "end"],
]) {
  test(`pressing ${name} key when a suggestion is selected unselects it`, () => {
    const { resourceCache, getByLabelText } = renderWithContext(
      <SearchFormProvider>
        <SearchForm />
      </SearchFormProvider>,
    );

    const input = getByLabelText(INPUT_LABEL);
    const menu = getByLabelText(SUGGESTIONS_LABEL);

    fireEvent.change(input, { target: { value: "react" } });

    act(() => {
      resourceCache.succeed(
        packageSuggestions,
        { query: "react", size: SUGGESTIONS_SIZE },
        fakePackageSuggestions({ size: SUGGESTIONS_SIZE }),
      );
    });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key });

    expect(input).not.toHaveAttribute("aria-activedescendant");
    expect(input).toMatchSnapshot();
    expect(menu.children[0]).toHaveAttribute("aria-selected", "false");
    expect(menu).toMatchSnapshot();
  });
}

test("pressing escape key collapses menu when menu is expanded", () => {
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      fakePackageSuggestions({ size: SUGGESTIONS_SIZE }),
    );
  });

  fireEvent.keyDown(input, { key: "Escape" });

  expect(input).toHaveAttribute("aria-expanded", "false");
  expect(input).toMatchSnapshot();
  expect(menu).toHaveStyle("display: none");
  expect(menu).toMatchSnapshot();
});

test("pressing escape key clears text when menu is collapsed", () => {
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      fakePackageSuggestions({ size: SUGGESTIONS_SIZE }),
    );
  });

  fireEvent.keyDown(input, { key: "Escape" });
  fireEvent.keyDown(input, { key: "Escape" });

  expect(input).toHaveAttribute("value", "");
  expect(input).toMatchSnapshot();
});

test("leaving input collapses menu", () => {
  const { resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      fakePackageSuggestions({ size: SUGGESTIONS_SIZE }),
    );
  });

  fireEvent.blur(input);

  expect(input).toHaveAttribute("aria-expanded", "false");
  expect(input).toMatchSnapshot();
  expect(menu).toHaveStyle("display: none");
  expect(menu).toMatchSnapshot();
});

test("pressing enter key when a suggestion is selected navigates to package page", () => {
  const { history, resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  const reactSuggestions = fakePackageSuggestions({ size: SUGGESTIONS_SIZE });
  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      reactSuggestions,
    );
  });

  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "Enter" });

  expect(history.location.pathname).toBe(
    `/package/${reactSuggestions[0].package.name}`,
  );
  expect(input).toHaveAttribute("aria-expanded", "false");
  expect(input).toMatchSnapshot();
  expect(menu).toHaveStyle("display: none");
  expect(menu).toMatchSnapshot();
});

test("clicking on a suggestion navigates to package page", () => {
  const { history, resourceCache, getByLabelText } = renderWithContext(
    <SearchFormProvider>
      <SearchForm />
    </SearchFormProvider>,
  );

  const input = getByLabelText(INPUT_LABEL);
  const menu = getByLabelText(SUGGESTIONS_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  const reactSuggestions = fakePackageSuggestions({ size: SUGGESTIONS_SIZE });
  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      reactSuggestions,
    );
  });

  fireEvent.click(menu.children[1]);

  expect(history.location.pathname).toBe(
    `/package/${reactSuggestions[1].package.name}`,
  );
  expect(input).toHaveAttribute("aria-expanded", "false");
  expect(input).toMatchSnapshot();
  expect(menu).toHaveStyle("display: none");
  expect(menu).toMatchSnapshot();
});

test("selecting a suggestion preloads the package page", () => {
  const preload = jest.fn(() => Promise.resolve());
  const { resourceCache, getByLabelText } = renderRoutesWithContext([
    {
      path: "/",
      render: () => (
        <SearchFormProvider>
          <SearchForm />
        </SearchFormProvider>
      ),
    },
    {
      path: "/package/:name",
      preload,
      render: () => "package",
    },
  ]);

  const input = getByLabelText(INPUT_LABEL);

  fireEvent.change(input, { target: { value: "react" } });

  const reactSuggestions = fakePackageSuggestions({ size: SUGGESTIONS_SIZE });
  act(() => {
    resourceCache.succeed(
      packageSuggestions,
      { query: "react", size: SUGGESTIONS_SIZE },
      reactSuggestions,
    );
  });

  fireEvent.keyDown(input, { key: "ArrowDown" });

  expect(preload).toHaveBeenCalledTimes(1);
  expect(preload).toHaveBeenCalledWith({
    action: "PRELOAD",
    location: createLocation(`/package/${reactSuggestions[0].package.name}`),
    params: {
      name: reactSuggestions[0].package.name,
    },
  });
});
