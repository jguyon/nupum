import React from "react";
import { css } from "@emotion/core";
import SearchIcon from "react-feather/dist/icons/search";
import { useNavigate, usePreload, useMatch } from "../../router";
import {
  rhythm,
  scale,
  color,
  primaryColor,
  compactLineHeight,
} from "../theme";
import useHydration from "../use-hydration";
import SearchFormProvider, { useSearchFormQuery } from "./search-form-provider";
import useSearchSuggestions from "./use-search-suggestions";
import Input from "./input";

const SUGGESTION_LIST_ID = "search-suggestion-list";
const SUGGESTION_LIST_ITEM_ID_PREFIX = "search-suggestion-list-item";

export { SearchFormProvider };

export default function SearchForm(props) {
  const [query, setQuery] = useSearchFormQuery();
  const navigate = useNavigate();
  const preload = usePreload();
  const isHydrating = useHydration();

  // we want the form to look like it can be used while the js is downloading
  const isSubmitDisabled = !isHydrating && query.trim().length === 0;

  function onFormSubmit(event) {
    event.preventDefault();
    if (!isSubmitDisabled) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  function onSubmitMouseEnter() {
    if (!isSubmitDisabled) {
      preload(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <div {...props} role="search">
      <form
        css={formStyles}
        data-testid="search-form"
        method="GET"
        action="/search"
        onSubmit={onFormSubmit}
      >
        <SearchInputWithSuggestions query={query} setQuery={setQuery} />

        <button
          css={[submitStyles, isSubmitDisabled && submitDisabledStyles]}
          type="submit"
          aria-label="Search"
          aria-disabled={isSubmitDisabled}
          onMouseEnter={onSubmitMouseEnter}
        >
          <SearchIcon css={submitIconStyles} />
        </button>
      </form>
    </div>
  );
}

function SearchInputWithSuggestions({ query, setQuery }) {
  const navigate = useNavigate();
  const preload = usePreload();
  const {
    menuExpanded,
    currentIndex,
    suggestions,
    onInputBlur,
    onInputKeyDown,
    onItemClick,
    onItemMouseMove,
    onItemMouseDown,
  } = useSearchSuggestions({
    query,
    setQuery,
    onSelect: ({ package: { name } }) => preload(`/package/${name}`),
    onGoTo: ({ package: { name } }) => navigate(`/package/${name}`),
  });

  return (
    <div css={inputContainerStyles}>
      <SearchInput
        menuExpanded={menuExpanded}
        currentIndex={currentIndex}
        value={query}
        onChangeValue={setQuery}
        onBlur={onInputBlur}
        onKeyDown={onInputKeyDown}
      />

      <SearchSuggestions
        menuExpanded={menuExpanded}
        currentIndex={currentIndex}
        suggestions={suggestions}
        onItemClick={onItemClick}
        onItemMouseMove={onItemMouseMove}
        onItemMouseDown={onItemMouseDown}
      />
    </div>
  );
}

function SearchInput({
  menuExpanded,
  currentIndex,
  value,
  onChangeValue,
  onBlur,
  onKeyDown,
}) {
  const inputAutoFocus = !!useMatch("/");

  return (
    <Input
      css={inputStyles}
      autoFocus={inputAutoFocus}
      type="search"
      name="q"
      role="combobox"
      aria-label="Search query"
      aria-autocomplete="list"
      aria-expanded={menuExpanded}
      aria-haspopup={true}
      aria-controls={SUGGESTION_LIST_ID}
      aria-activedescendant={
        currentIndex === null
          ? undefined
          : `${SUGGESTION_LIST_ITEM_ID_PREFIX}-${currentIndex}`
      }
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      value={value}
      onChangeValue={onChangeValue}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  );
}

function SearchSuggestions({
  menuExpanded,
  currentIndex,
  suggestions,
  onItemClick,
  onItemMouseMove,
  onItemMouseDown,
}) {
  return (
    <ul
      css={[menuStyles, menuExpanded || menuCollapsedStyles]}
      role="listbox"
      aria-label="Package suggestions"
      id={SUGGESTION_LIST_ID}
    >
      {suggestions.map(
        ({ package: { name, description }, highlight }, index) => (
          <li
            key={name}
            css={[
              menuItemStyles,
              index === currentIndex && menuItemSelectedStyles,
            ]}
            role="option"
            aria-selected={index === currentIndex}
            id={`${SUGGESTION_LIST_ITEM_ID_PREFIX}-${index}`}
            onClick={() => onItemClick(index)}
            onMouseMove={() => onItemMouseMove(index)}
            onMouseDown={onItemMouseDown}
          >
            <h3
              css={menuItemHeadingStyles}
              dangerouslySetInnerHTML={{ __html: highlight }}
            />
            {description && (
              <p css={menuItemDescriptionStyles}>{description}</p>
            )}
          </li>
        ),
      )}
    </ul>
  );
}

const formStyles = css`
  display: flex;
`;

const inputContainerStyles = css`
  position: relative;
  flex-grow: 1;
`;

const inputStyles = css`
  width: 100%;
  height: ${rhythm(1, 2)};
  padding: 0 ${rhythm(1, -1)} 0 ${rhythm(1)};

  border: 1px solid ${color("gray", 5)};
  border-right-width: 0;
  border-top-left-radius: 999px;
  border-bottom-left-radius: 999px;

  &:focus {
    outline: none;
  }

  // https://blog.maximerouiller.com/post/remove-the-x-from-internet-explorer-and-chrome-input-type-search/
  &::-ms-clear,
  &::-ms-reveal {
    display: none;
    width: 0;
    height: 0;
  }
  &::-webkit-search-decoration,
  &::-webkit-search-cancel-button,
  &::-webkit-search-results-button,
  &::-webkit-search-results-decoration {
    display: none;
  }
`;

const menuStyles = css`
  background-color: ${color("white")};
  border: 1px solid ${color("gray", 5)};
  border-radius: 3px;
  overflow: hidden;

  position: absolute;
  top: calc(${rhythm(1, 3)} - 1px);
  left: calc(${rhythm(1, -1)} - 1px);
  right: calc(${rhythm(1, -2)} - 1px);

  list-style-type: none;
  text-align: left;

  padding: 0;
  margin: 0;
`;

const menuCollapsedStyles = css`
  display: none;
`;

const menuItemStyles = css`
  padding: ${rhythm(0, 0.5)} ${rhythm(0, 1)};
  cursor: pointer;
  transition: background-color 0.15s ease-out;
`;

const menuItemSelectedStyles = css`
  background-color: ${color("gray", 1)};
`;

const menuItemHeadingStyles = css`
  ${scale(0, -1, compactLineHeight)}
  margin: 0;
  color: ${color("gray", 8)};
`;

const menuItemDescriptionStyles = css`
  ${scale(0, -2, compactLineHeight)}
  margin: 0;

  color: ${color("gray", 6)};

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const submitStyles = css`
  display: flex;
  align-items: center;

  height: ${rhythm(1, 2)};
  padding: 0 ${rhythm(1)} 0 ${rhythm(1, -1)};

  border: 0;
  border-top-right-radius: 999px;
  border-bottom-right-radius: 999px;

  background-color: ${color(primaryColor, 5)};
  color: ${color("white")};

  cursor: pointer;

  transition: background-color 0.15s ease-out;
  &:hover,
  &:focus {
    outline: none;
    background-color: ${color(primaryColor, 3)};
  }
`;

const submitDisabledStyles = css`
  cursor: not-allowed;
  background-color: ${color(primaryColor, 2)};
  &:hover {
    background-color: ${color(primaryColor, 2)};
  }
`;

const submitIconStyles = css`
  width: ${rhythm(1)};
  height: ${rhythm(1)};
`;
