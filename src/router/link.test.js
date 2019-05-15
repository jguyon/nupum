import React from "react";
import {
  renderWithContext,
  renderRoutesWithContext,
  fireEvent,
} from "../test/react";
import Link from "./link";

test("link is rendered", () => {
  const { container, getByTestId } = renderWithContext(
    <Link to="/path" data-testid="link">
      go to path
    </Link>,
  );

  const link = getByTestId("link");

  expect(link).toBeInstanceOf(HTMLAnchorElement);
  expect(link).toHaveAttribute("href", "/path");
  expect(link).toHaveTextContent("go to path");
  expect(container).toMatchSnapshot();
});

test("clicking link pushes to history", () => {
  const { getByText, history } = renderWithContext(
    <Link to="/path">go to path</Link>,
  );

  fireEvent.click(getByText("go to path"));

  expect(history.length).toBe(2);
  expect(history.location.pathname).toBe("/path");
});

test("clicking link with replace prop replaces history", () => {
  const { getByText, history } = renderWithContext(
    <Link to="/path" replace>
      go to path
    </Link>,
  );

  fireEvent.click(getByText("go to path"));

  expect(history.length).toBe(1);
  expect(history.location.pathname).toBe("/path");
});

test("clicking link with state prop stores state in history", () => {
  const { getByText, history } = renderWithContext(
    <Link to="/path" state="some state">
      go to path
    </Link>,
  );

  fireEvent.click(getByText("go to path"));

  expect(history.location.pathname).toBe("/path");
  expect(history.location.state).toBe("some state");
});

test("clicking link calls onClick handler", () => {
  const onClick = jest.fn(() => {});
  const { getByText } = renderWithContext(
    <Link to="/path" onClick={onClick}>
      go to path
    </Link>,
  );

  fireEvent.click(getByText("go to path"));

  expect(onClick).toHaveBeenCalledTimes(1);
});

test("clicking link does not navigate when event default is prevented", () => {
  const { getByText, history } = renderWithContext(
    <Link
      to="/path"
      onClick={event => {
        event.preventDefault();
      }}
    >
      go to path
    </Link>,
  );

  fireEvent.click(getByText("go to path"));

  expect(history.location.pathname).toBe("/");
});

test("hovering link preloads route", () => {
  const preload = jest.fn(() => Promise.resolve());
  const { getByText } = renderRoutesWithContext([
    {
      path: "/",
      render: () => <Link to="/path">go to path</Link>,
    },
    {
      path: "/path",
      preload,
      render: () => "path",
    },
  ]);

  fireEvent.mouseEnter(getByText("go to path"));

  expect(preload).toHaveBeenCalledTimes(1);
});

test("hovering link after url change preloads route", () => {
  const preload = jest.fn(() => Promise.resolve());
  const { getByText } = renderRoutesWithContext([
    {
      path: "/",
      render: () => <Link to="/one">go to one</Link>,
    },
    {
      path: "/one",
      preload: () => Promise.resolve(),
      render: () => <Link to="/two">go to two</Link>,
    },
    {
      path: "/two",
      preload,
      render: () => "two",
    },
  ]);

  fireEvent.mouseEnter(getByText("go to one"));
  fireEvent.click(getByText("go to one"));
  fireEvent.mouseEnter(getByText("go to two"));

  expect(preload).toHaveBeenCalledTimes(1);
});

test("hovering link calls onMouseEnter handler", () => {
  const onMouseEnter = jest.fn(() => {});
  const { getByText } = renderWithContext(
    <Link to="/path" onMouseEnter={onMouseEnter}>
      go to path
    </Link>,
  );

  fireEvent.mouseEnter(getByText("go to path"));

  expect(onMouseEnter).toHaveBeenCalledTimes(1);
});

test("hovering link does not preload when event default is prevented", () => {
  const preload = jest.fn(() => Promise.resolve());
  const { getByText } = renderRoutesWithContext([
    {
      path: "/",
      render: () => (
        <Link
          to="/path"
          onMouseEnter={event => {
            event.preventDefault();
          }}
        >
          go to path
        </Link>
      ),
    },
    {
      path: "/path",
      preload,
      render: () => "path",
    },
  ]);

  fireEvent.mouseEnter(getByText("go to path"));

  expect(preload).not.toHaveBeenCalled();
});
