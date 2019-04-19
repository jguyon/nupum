import React from "react";
import { renderToString } from "react-dom/server";
import { createMemoryHistory, createLocation } from "history";
import { render, act, wait, fireEvent } from "../test/react";
import createStaticHistory from "./create-static-history";
import Router, {
  preloadRoutes,
  useNavigate,
  usePreload,
  useMatch,
  useStatusCode,
} from "./router";

jest.useFakeTimers();

// stub console.error until `act(...)` warnings can be fixed
// https://github.com/facebook/react/issues/14769
const consoleError = jest.spyOn(console, "error");
consoleError.mockImplementation(() => {});

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

describe("Router", () => {
  test("matching route is rendered", () => {
    const history = createMemoryHistory({ initialEntries: ["/match"] });
    const rootRender = jest.fn(() => "root");
    const matchRender = jest.fn(() => "match");
    const routes = [
      {
        path: "/",
        render: rootRender,
      },
      {
        path: "/match",
        render: matchRender,
      },
    ];

    const { container } = render(<Router history={history} routes={routes} />);

    expect(container).toHaveTextContent("match");
    expect(rootRender).not.toHaveBeenCalled();
    expect(matchRender).toHaveBeenCalledWith({
      location: history.location,
      action: history.action,
      params: {},
      children: null,
    });
  });

  test("matching child route is rendered", () => {
    const history = createMemoryHistory({
      initialEntries: ["/match/submatch"],
    });
    const subRootRender = jest.fn(() => "root");
    const subMatchRender = jest.fn(() => "match");
    const routes = [
      {
        path: "/match/*",
        render: ({ children }) => <div data-testid="parent">{children}</div>,
        routes: [
          {
            path: "/",
            render: subRootRender,
          },
          {
            path: "/submatch",
            render: subMatchRender,
          },
        ],
      },
    ];

    const { getByTestId } = render(
      <Router history={history} routes={routes} />,
    );

    expect(getByTestId("parent")).toHaveTextContent("match");
    expect(subRootRender).not.toHaveBeenCalled();
    expect(subMatchRender).toHaveBeenCalledWith({
      location: history.location,
      action: history.action,
      params: {},
      children: null,
    });
  });

  test("matching route is rendered with params", () => {
    const history = createMemoryHistory({ initialEntries: ["/match/one"] });
    const matchRender = jest.fn(() => "match");
    const routes = [
      {
        path: "/match/:param",
        render: matchRender,
      },
    ];

    const { container } = render(<Router history={history} routes={routes} />);

    expect(container).toHaveTextContent("match");
    expect(matchRender).toHaveBeenCalledWith({
      location: history.location,
      action: history.action,
      params: { param: "one" },
      children: null,
    });
  });

  test("history push renders matching route", () => {
    const history = createMemoryHistory({ initialEntries: ["/"] });
    const matchRender = jest.fn(() => "match");
    const routes = [
      {
        path: "/",
        render: () => "root",
      },
      {
        path: "/match",
        render: matchRender,
      },
    ];

    const { container } = render(<Router history={history} routes={routes} />);
    expect(container).toHaveTextContent("root");
    act(() => {
      history.push("/match");
    });

    expect(container).toHaveTextContent("match");
    expect(matchRender).toHaveBeenCalledWith({
      location: history.location,
      action: "PUSH",
      params: {},
      children: null,
    });
  });

  test("history pop renders matching route", () => {
    const history = createMemoryHistory({
      initialEntries: ["/match", "/"],
      initialIndex: 1,
    });
    const matchRender = jest.fn(() => "match");
    const routes = [
      {
        path: "/",
        render: () => "root",
      },
      {
        path: "/match",
        render: matchRender,
      },
    ];

    const { container } = render(<Router history={history} routes={routes} />);
    expect(container).toHaveTextContent("root");
    act(() => {
      history.goBack();
    });

    expect(container).toHaveTextContent("match");
    expect(matchRender).toHaveBeenCalledWith({
      location: history.location,
      action: "POP",
      params: {},
      children: null,
    });
  });

  test("history prop change renders matching route", () => {
    const rootHistory = createMemoryHistory({ initialEntries: ["/"] });
    const matchHistory = createMemoryHistory({ initialEntries: ["/match"] });
    const matchRender = jest.fn(() => "match");
    const routes = [
      {
        path: "/",
        render: () => "root",
      },
      {
        path: "/match",
        render: matchRender,
      },
    ];

    const { container, rerender } = render(
      <Router history={rootHistory} routes={routes} />,
    );
    expect(container).toHaveTextContent("root");
    rerender(<Router history={matchHistory} routes={routes} />);

    expect(container).toHaveTextContent("match");
    expect(matchRender).toHaveBeenCalledWith({
      location: matchHistory.location,
      action: matchHistory.action,
      params: {},
      children: null,
    });
  });

  test("routes prop change renders matching route", () => {
    const history = createMemoryHistory({ initialEntries: ["/match"] });

    const firstRoutes = [
      {
        path: "/match",
        render: () => "first match",
      },
    ];

    const secondMatchRender = jest.fn(() => "second match");
    const secondRoutes = [
      {
        path: "/match",
        render: secondMatchRender,
      },
    ];

    const { container, rerender } = render(
      <Router history={history} routes={firstRoutes} />,
    );
    expect(container).toHaveTextContent("first match");
    rerender(<Router history={history} routes={secondRoutes} />);

    expect(container).toHaveTextContent("second match");
    expect(secondMatchRender).toHaveBeenCalledWith({
      location: history.location,
      action: history.action,
      params: {},
      children: null,
    });
  });

  test("matching route is not preloaded when timeout prop is 0", () => {
    const history = createMemoryHistory();
    const rootPreload = jest.fn(() => Promise.resolve());
    const matchPreload = jest.fn(() => Promise.resolve());
    const routes = [
      {
        path: "/",
        preload: rootPreload,
        render: () => "root",
      },
      {
        path: "/match",
        preload: matchPreload,
        render: () => "match",
      },
    ];

    render(<Router history={history} routes={routes} preloadTimeout={0} />);
    act(() => {
      history.push("/match");
    });

    expect(rootPreload).not.toHaveBeenCalled();
    expect(matchPreload).not.toHaveBeenCalled();
  });

  test("matching route is preloaded when timeout prop is greater than 0", () => {
    const history = createMemoryHistory();
    const rootPreload = jest.fn(() => Promise.resolve());
    const matchPreload = jest.fn(() => Promise.resolve());
    const routes = [
      {
        path: "/",
        preload: rootPreload,
        render: () => "root",
      },
      {
        path: "/match",
        preload: matchPreload,
        render: () => "match",
      },
    ];

    render(<Router history={history} routes={routes} preloadTimeout={1} />);
    act(() => {
      history.push("/match");
    });

    expect(rootPreload).not.toHaveBeenCalled();
    expect(matchPreload).toHaveBeenCalledTimes(1);
    expect(matchPreload).toHaveBeenCalledWith({
      location: history.location,
      action: history.action,
      params: {},
    });
  });

  test("matching route is preloaded with params", () => {
    const history = createMemoryHistory();
    const matchPreload = jest.fn(() => Promise.resolve());
    const routes = [
      {
        path: "/",
        render: () => "root",
      },
      {
        path: "/match/:param",
        preload: matchPreload,
        render: () => "match",
      },
    ];

    render(<Router history={history} routes={routes} preloadTimeout={1000} />);
    act(() => {
      history.push("/match/one");
    });

    expect(matchPreload).toHaveBeenCalledTimes(1);
    expect(matchPreload).toHaveBeenCalledWith({
      location: history.location,
      action: history.action,
      params: { param: "one" },
    });
  });

  test("matching route is preloaded with preload props", () => {
    const history = createMemoryHistory();
    const matchPreload = jest.fn(() => Promise.resolve());
    const routes = [
      {
        path: "/",
        render: () => "root",
      },
      {
        path: "/match",
        preload: matchPreload,
        render: () => "match",
      },
    ];

    render(
      <Router
        history={history}
        routes={routes}
        preloadTimeout={1000}
        preloadProps={{ preloadProp: "preloadValue" }}
      />,
    );
    act(() => {
      history.push("/match");
    });

    expect(matchPreload).toHaveBeenCalledTimes(1);
    expect(matchPreload).toHaveBeenCalledWith({
      location: history.location,
      action: history.action,
      params: {},
      preloadProp: "preloadValue",
    });
  });

  test("matching route is rendered when preload resolves before timeout", async () => {
    const history = createMemoryHistory();
    const routes = [
      {
        path: "/",
        render: () => "root",
      },
      {
        path: "/match",
        preload: () => delay(500),
        render: () => "match",
      },
    ];

    const { container } = render(
      <Router history={history} routes={routes} preloadTimeout={1000} />,
    );
    act(() => {
      history.push("/match");
    });
    expect(container).toHaveTextContent("root");
    jest.advanceTimersByTime(500);

    await wait(() => {
      expect(container).toHaveTextContent("match");
    });
  });

  test("matching route is rendered when preload rejects before timeout", async () => {
    const history = createMemoryHistory();
    const routes = [
      {
        path: "/",
        render: () => "root",
      },
      {
        path: "/match",
        preload: () => delay(500).then(() => Promise.reject("failure")),
        render: () => "match",
      },
    ];

    const { container } = render(
      <Router history={history} routes={routes} preloadTimeout={1000} />,
    );
    act(() => {
      history.push("/match");
    });
    expect(container).toHaveTextContent("root");
    jest.advanceTimersByTime(500);

    await wait(() => {
      expect(container).toHaveTextContent("match");
    });
  });

  test("matching route is rendered when preload resolves after timeout", async () => {
    const history = createMemoryHistory();
    const routes = [
      {
        path: "/",
        render: () => "root",
      },
      {
        path: "/match",
        preload: () => delay(2000),
        render: () => "match",
      },
    ];

    const { container } = render(
      <Router history={history} routes={routes} preloadTimeout={1000} />,
    );
    act(() => {
      history.push("/match");
    });
    expect(container).toHaveTextContent("root");
    jest.advanceTimersByTime(1000);

    await wait(() => {
      expect(container).toHaveTextContent("match");
    });
  });

  test("matching route is rendered to string", () => {
    const history = createStaticHistory("/match");
    const routes = [
      {
        path: "/",
        render: () => "root",
      },
      {
        path: "/match",
        render: () => "match",
      },
    ];

    const html = renderToString(<Router history={history} routes={routes} />);

    expect(html).toBe("match");
  });
});

describe("preloadRoutes", () => {
  test("matching route is preloaded", async () => {
    const history = createMemoryHistory({ initialEntries: ["/match"] });
    const rootPreload = jest.fn(() => Promise.resolve());
    const matchPreload = jest.fn(() => Promise.resolve());
    const routes = [
      {
        path: "/",
        preload: rootPreload,
      },
      {
        path: "/match",
        preload: matchPreload,
      },
    ];

    await preloadRoutes(history, routes);

    expect(rootPreload).not.toBeCalled();
    expect(matchPreload).toBeCalledTimes(1);
    expect(matchPreload).toBeCalledWith({
      location: history.location,
      action: history.action,
      params: {},
    });
  });

  test("matching route is preloaded with params", async () => {
    const history = createMemoryHistory({ initialEntries: ["/match/one"] });
    const matchPreload = jest.fn(() => Promise.resolve());
    const routes = [
      {
        path: "/match/:param",
        preload: matchPreload,
      },
    ];

    await preloadRoutes(history, routes);

    expect(matchPreload).toBeCalledTimes(1);
    expect(matchPreload).toBeCalledWith({
      location: history.location,
      action: history.action,
      params: { param: "one" },
    });
  });

  test("matching route is preloaded with preload props", async () => {
    const history = createMemoryHistory({ initialEntries: ["/match"] });
    const matchPreload = jest.fn(() => Promise.resolve());
    const routes = [
      {
        path: "/match",
        preload: matchPreload,
      },
    ];

    await preloadRoutes(history, routes, { preloadProp: "preloadValue" });

    expect(matchPreload).toBeCalledTimes(1);
    expect(matchPreload).toBeCalledWith({
      location: history.location,
      action: history.action,
      params: {},
      preloadProp: "preloadValue",
    });
  });
});

describe("useNavigate", () => {
  test("given path is pushed", () => {
    function Root() {
      const navigate = useNavigate();

      return (
        <a
          href="/match"
          onClick={event => {
            event.preventDefault();
            navigate("/match");
          }}
        >
          go
        </a>
      );
    }

    const history = createMemoryHistory();
    const routes = [
      {
        path: "/",
        render: () => <Root />,
      },
      {
        path: "/match",
        render: () => "match",
      },
    ];

    const { container, getByText } = render(
      <Router history={history} routes={routes} />,
    );
    fireEvent.click(getByText("go"));

    expect(history.location.pathname).toBe("/match");
    expect(history.length).toBe(2);
    expect(container).toHaveTextContent("match");
  });

  test("given path is replaced", () => {
    function Root() {
      const navigate = useNavigate();

      return (
        <a
          href="/match"
          onClick={event => {
            event.preventDefault();
            navigate("/match", { replace: true });
          }}
        >
          go
        </a>
      );
    }

    const history = createMemoryHistory();
    const routes = [
      {
        path: "/",
        render: () => <Root />,
      },
      {
        path: "/match",
        render: () => "match",
      },
    ];

    const { container, getByText } = render(
      <Router history={history} routes={routes} />,
    );
    fireEvent.click(getByText("go"));

    expect(history.location.pathname).toBe("/match");
    expect(history.length).toBe(1);
    expect(container).toHaveTextContent("match");
  });

  test("given state is pushed", () => {
    function Root() {
      const navigate = useNavigate();

      return (
        <a
          href="/match"
          onClick={event => {
            event.preventDefault();
            navigate("/match", { state: "some state" });
          }}
        >
          go
        </a>
      );
    }

    const history = createMemoryHistory();
    const routes = [
      {
        path: "/",
        render: () => <Root />,
      },
      {
        path: "/match",
        render: () => "match",
      },
    ];

    const { getByText } = render(<Router history={history} routes={routes} />);
    fireEvent.click(getByText("go"));

    expect(history.location.pathname).toBe("/match");
    expect(history.length).toBe(2);
    expect(history.location.state).toBe("some state");
  });

  test("given state is replaced", () => {
    function Root() {
      const navigate = useNavigate();

      return (
        <a
          href="/match"
          onClick={event => {
            event.preventDefault();
            navigate("/match", { state: "some state", replace: true });
          }}
        >
          go
        </a>
      );
    }

    const history = createMemoryHistory();
    const routes = [
      {
        path: "/",
        render: () => <Root />,
      },
      {
        path: "/match",
        render: () => "match",
      },
    ];

    const { getByText } = render(<Router history={history} routes={routes} />);
    fireEvent.click(getByText("go"));

    expect(history.location.pathname).toBe("/match");
    expect(history.length).toBe(1);
    expect(history.location.state).toBe("some state");
  });
});

describe("usePreload", () => {
  test("given path is preloaded", () => {
    function Root() {
      const preload = usePreload();

      return (
        <button type="button" onClick={() => preload("/match")}>
          preload
        </button>
      );
    }

    const history = createMemoryHistory();
    const rootPreload = jest.fn(() => Promise.resolve());
    const matchPreload = jest.fn(() => Promise.resolve());
    const routes = [
      {
        path: "/",
        preload: rootPreload,
        render: () => <Root />,
      },
      {
        path: "/match",
        preload: matchPreload,
        render: () => "match",
      },
    ];

    const { getByText } = render(<Router history={history} routes={routes} />);
    fireEvent.click(getByText("preload"));

    expect(rootPreload).not.toHaveBeenCalled();
    expect(matchPreload).toHaveBeenCalledTimes(1);
    expect(matchPreload).toHaveBeenCalledWith({
      location: createLocation("/match"),
      action: "PRELOAD",
      params: {},
    });
  });

  test("given path is preloaded with params", () => {
    function Root() {
      const preload = usePreload();

      return (
        <button type="button" onClick={() => preload("/match/one")}>
          preload
        </button>
      );
    }

    const history = createMemoryHistory();
    const matchPreload = jest.fn(() => Promise.resolve());
    const routes = [
      {
        path: "/",
        render: () => <Root />,
      },
      {
        path: "/match/:param",
        preload: matchPreload,
        render: () => "match",
      },
    ];

    const { getByText } = render(<Router history={history} routes={routes} />);
    fireEvent.click(getByText("preload"));

    expect(matchPreload).toHaveBeenCalledTimes(1);
    expect(matchPreload).toHaveBeenCalledWith({
      location: createLocation("/match/one"),
      action: "PRELOAD",
      params: { param: "one" },
    });
  });

  test("given path is preloaded with props", () => {
    function Root() {
      const preload = usePreload();

      return (
        <button type="button" onClick={() => preload("/match")}>
          preload
        </button>
      );
    }

    const history = createMemoryHistory();
    const matchPreload = jest.fn(() => Promise.resolve());
    const routes = [
      {
        path: "/",
        render: () => <Root />,
      },
      {
        path: "/match",
        preload: matchPreload,
        render: () => "match",
      },
    ];

    const { getByText } = render(
      <Router
        history={history}
        routes={routes}
        preloadProps={{ preloadProp: "preloadValue" }}
      />,
    );
    fireEvent.click(getByText("preload"));

    expect(matchPreload).toHaveBeenCalledTimes(1);
    expect(matchPreload).toHaveBeenCalledWith({
      location: createLocation("/match"),
      action: "PRELOAD",
      params: {},
      preloadProp: "preloadValue",
    });
  });

  test("given path is preloaded with state", () => {
    function Root() {
      const preload = usePreload();

      return (
        <button
          type="button"
          onClick={() => preload("/match", { state: "some state" })}
        >
          preload
        </button>
      );
    }

    const history = createMemoryHistory();
    const matchPreload = jest.fn(() => Promise.resolve());
    const routes = [
      {
        path: "/",
        render: () => <Root />,
      },
      {
        path: "/match",
        preload: matchPreload,
        render: () => "match",
      },
    ];

    const { getByText } = render(<Router history={history} routes={routes} />);
    fireEvent.click(getByText("preload"));

    expect(matchPreload).toHaveBeenCalledTimes(1);
    expect(matchPreload).toHaveBeenCalledWith({
      location: createLocation("/match", "some state"),
      action: "PRELOAD",
      params: {},
    });
  });
});

describe("useMatch", () => {
  test("null is returned when path does not match", () => {
    function Root() {
      const params = useMatch("/match/:param");
      return params ? "a match" : "no match";
    }

    const history = createMemoryHistory();
    const routes = [
      {
        path: "/",
        render: () => <Root />,
      },
    ];

    const { container } = render(<Router history={history} routes={routes} />);

    expect(container).toHaveTextContent("no match");
  });

  test("match is returned when path matches", () => {
    function Match() {
      const match = useMatch("/match");
      return match ? `location: ${JSON.stringify(match.location)}` : "no match";
    }

    const history = createMemoryHistory({ initialEntries: ["/match"] });
    const routes = [
      {
        path: "/match",
        render: () => <Match />,
      },
    ];

    const { container } = render(<Router history={history} routes={routes} />);

    expect(container).toHaveTextContent(
      `location: ${JSON.stringify(history.location)}`,
    );
  });

  test("match is returned with params", () => {
    function Match() {
      const match = useMatch("/match/:param");
      return match ? `params: ${JSON.stringify(match.params)}` : "no match";
    }

    const history = createMemoryHistory({ initialEntries: ["/match/one"] });
    const routes = [
      {
        path: "/match/one",
        render: () => <Match />,
      },
    ];

    const { container } = render(<Router history={history} routes={routes} />);

    expect(container).toHaveTextContent(
      `params: ${JSON.stringify({ param: "one" })}`,
    );
  });
});

describe("useStatusCode", () => {
  function NotFound() {
    useStatusCode(404);
    return null;
  }

  const routes = [
    {
      path: "/*",
      render: () => <NotFound />,
    },
  ];

  test("statusCode is set on static history", () => {
    const history = createStaticHistory("/");

    renderToString(<Router history={history} routes={routes} />);

    expect(history.statusCode).toBe(404);
  });

  test("statusCode is not set on non-static history", () => {
    const history = createMemoryHistory();

    renderToString(<Router history={history} routes={routes} />);

    expect(history.statusCode).toBe(undefined);
  });
});
