import { useState, useReducer, useMemo, useEffect } from "react";
import invariant from "tiny-invariant";
import { useResource, RESOURCE_SUCCESS } from "../../resource-cache";
import { packageSuggestions } from "../../resources";

const SUGGESTIONS_SIZE = 10;

export default function useSearchSuggestions({
  query,
  setQuery,
  onSelect,
  onGoTo,
}) {
  invariant(typeof query === "string", "expected query to be a string");
  invariant(
    typeof setQuery === "function",
    "expected setQuery to be a function",
  );
  invariant(
    typeof onSelect === "function",
    "expected onSelect to be a function",
  );
  invariant(typeof onGoTo === "function", "expected onGoTo to be a function");

  const [
    { menuExpanded, currentIndex, suggestions },
    dispatch,
  ] = useAutoCompleteState(useSuggestions(query));

  useEffect(
    () => {
      if (currentIndex !== null) {
        onSelect(suggestions[currentIndex]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentIndex, suggestions],
  );

  function onInputBlur() {
    dispatch({ type: ACTION_INPUT_BLUR });
  }

  function onInputKeyDown(event) {
    switch (event.key) {
      case "ArrowUp":
        dispatch({ type: ACTION_INPUT_PRESS_UP });
        event.preventDefault();
        break;
      case "ArrowDown":
        dispatch({ type: ACTION_INPUT_PRESS_DOWN });
        event.preventDefault();
        break;
      case "ArrowLeft":
        dispatch({ type: ACTION_INPUT_PRESS_LEFT });
        break;
      case "ArrowRight":
        dispatch({ type: ACTION_INPUT_PRESS_RIGHT });
        break;
      case "Home":
        dispatch({ type: ACTION_INPUT_PRESS_HOME });
        break;
      case "End":
        dispatch({ type: ACTION_INPUT_PRESS_END });
        break;
      case "Enter":
        dispatch({ type: ACTION_INPUT_PRESS_ENTER });
        if (menuExpanded && currentIndex !== null) {
          event.preventDefault();
          onGoTo(suggestions[currentIndex]);
        }
        break;
      case "Escape":
        dispatch({ type: ACTION_INPUT_PRESS_ESCAPE });
        event.preventDefault();
        if (!menuExpanded) {
          setQuery("");
        }
        break;
      default:
    }
  }

  function onItemClick(index) {
    if (index >= 0 && index < suggestions.length) {
      dispatch({ type: ACTION_ITEM_CLICK });
      onGoTo(suggestions[index]);
    }
  }

  function onItemMouseMove(index) {
    if (index >= 0 && index < suggestions.length) {
      dispatch({
        type: ACTION_ITEM_HOVER,
        index,
      });
    }
  }

  function onItemMouseDown(event) {
    // Prevent focus from leaving the input when clicking a suggestion
    event.preventDefault();
  }

  return {
    menuExpanded,
    currentIndex,
    suggestions,
    onInputBlur,
    onInputKeyDown,
    onItemClick,
    onItemMouseMove,
    onItemMouseDown,
  };
}

const emptySuggestions = [];

function useSuggestions(query) {
  const shouldFetch = query.trim().length > 0;
  const suggestionsResult = useResource(
    shouldFetch ? packageSuggestions : null,
    useMemo(() => ({ query, size: SUGGESTIONS_SIZE }), [query]),
  );

  const [state, setState] = useState({
    suggestionsResult,
    suggestions:
      suggestionsResult.status === RESOURCE_SUCCESS
        ? suggestionsResult.data
        : emptySuggestions,
  });

  if (
    suggestionsResult !== state.suggestionsResult &&
    suggestionsResult.status === RESOURCE_SUCCESS
  ) {
    setState({
      suggestionsResult,
      suggestions: suggestionsResult.data,
    });
  }

  return {
    query,
    suggestions: shouldFetch ? state.suggestions : emptySuggestions,
  };
}

const ACTION_UPDATE_QUERY = Symbol("ACTION_UPDATE_QUERY");
const ACTION_UPDATE_SUGGESTIONS = Symbol("ACTION_UPDATE_SUGGESTIONS");
const ACTION_INPUT_BLUR = Symbol("ACTION_INPUT_BLUR");
const ACTION_INPUT_PRESS_UP = Symbol("ACTION_INPUT_PRESS_UP");
const ACTION_INPUT_PRESS_DOWN = Symbol("ACTION_INPUT_PRESS_DOWN");
const ACTION_INPUT_PRESS_LEFT = Symbol("ACTION_INPUT_PRESS_LEFT");
const ACTION_INPUT_PRESS_RIGHT = Symbol("ACTION_INPUT_PRESS_RIGHT");
const ACTION_INPUT_PRESS_HOME = Symbol("ACTION_INPUT_PRESS_HOME");
const ACTION_INPUT_PRESS_END = Symbol("ACTION_INPUT_PRESS_END");
const ACTION_INPUT_PRESS_ENTER = Symbol("ACTION_INPUT_PRESS_ENTER");
const ACTION_INPUT_PRESS_ESCAPE = Symbol("ACTION_INPUT_PRESS_ESCAPE");
const ACTION_ITEM_CLICK = Symbol("ACTION_ITEM_CLICK");
const ACTION_ITEM_HOVER = Symbol("ACTION_ITEM_HOVER");

function useAutoCompleteState(props) {
  const [
    { query, menuExpanded, currentIndex, suggestions },
    dispatch,
  ] = useReducer(reducer, props, initializer);

  if (props.query !== query) {
    dispatch({
      type: ACTION_UPDATE_QUERY,
      query: props.query,
    });
  }

  if (props.suggestions !== suggestions) {
    dispatch({
      type: ACTION_UPDATE_SUGGESTIONS,
      suggestions: props.suggestions,
    });
  }

  return [
    {
      menuExpanded: menuExpanded && suggestions.length > 0,
      currentIndex,
      suggestions,
    },
    dispatch,
  ];
}

function initializer({ query, suggestions }) {
  return {
    query,
    suggestions,
    menuExpanded: false,
    currentIndex: null,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case ACTION_UPDATE_SUGGESTIONS: {
      const { currentIndex } = state;
      const { suggestions } = action;

      return {
        ...state,
        suggestions,
        currentIndex: currentIndex < suggestions.length ? currentIndex : null,
      };
    }

    case ACTION_UPDATE_QUERY: {
      const { query } = action;

      return {
        ...state,
        query,
        menuExpanded: true,
        currentIndex: null,
      };
    }

    case ACTION_INPUT_PRESS_UP: {
      const { menuExpanded, currentIndex, suggestions } = state;

      if (menuExpanded) {
        if (currentIndex === null) {
          if (suggestions.length > 0) {
            return {
              ...state,
              currentIndex: suggestions.length - 1,
            };
          } else {
            return state;
          }
        } else if (currentIndex > 0) {
          return {
            ...state,
            currentIndex: currentIndex - 1,
          };
        } else {
          return {
            ...state,
            currentIndex: null,
          };
        }
      } else {
        return {
          ...state,
          menuExpanded: true,
        };
      }
    }

    case ACTION_INPUT_PRESS_DOWN: {
      const { menuExpanded, currentIndex, suggestions } = state;

      if (menuExpanded) {
        if (currentIndex === null) {
          if (suggestions.length > 0) {
            return {
              ...state,
              currentIndex: 0,
            };
          } else {
            return state;
          }
        } else if (currentIndex < suggestions.length - 1) {
          return {
            ...state,
            currentIndex: currentIndex + 1,
          };
        } else {
          return {
            ...state,
            currentIndex: null,
          };
        }
      } else {
        return {
          ...state,
          menuExpanded: true,
        };
      }
    }

    case ACTION_INPUT_PRESS_LEFT:
    case ACTION_INPUT_PRESS_RIGHT:
    case ACTION_INPUT_PRESS_HOME:
    case ACTION_INPUT_PRESS_END: {
      return {
        ...state,
        currentIndex: null,
      };
    }

    case ACTION_ITEM_HOVER: {
      const { menuExpanded, currentIndex } = state;
      const { index } = action;

      if (menuExpanded && index !== currentIndex) {
        return {
          ...state,
          currentIndex: index,
        };
      } else {
        return state;
      }
    }

    case ACTION_INPUT_BLUR:
    case ACTION_INPUT_PRESS_ENTER:
    case ACTION_INPUT_PRESS_ESCAPE:
    case ACTION_ITEM_CLICK: {
      const { menuExpanded } = state;

      if (menuExpanded) {
        return {
          ...state,
          menuExpanded: false,
          currentIndex: null,
        };
      } else {
        return state;
      }
    }

    default: {
      invariant(false, `invalid action type ${action.type}`);
    }
  }
}
