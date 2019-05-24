import React from "react";
import { renderWithContext, act } from "../../test/react";
import languageModules from "./package-page-readme-language-modules";
import PackagePageReadme from "./package-page-readme";

test("markdown is rendered", () => {
  const { container } = renderWithContext(
    <PackagePageReadme
      contents={`
# Hello, world!

This is some markdown.
`}
    />,
  );

  expect(container).toMatchSnapshot();
});

test("message is rendered when there are no contents", () => {
  const { container } = renderWithContext(<PackagePageReadme />);

  expect(container).toMatchSnapshot();
});

test("code is shown without syntax highlighting when no language is specified", () => {
  const { container } = renderWithContext(
    <PackagePageReadme
      contents={`
\`\`\`
const add = (a, b) => a + b;
\`\`\`
`}
    />,
  );

  expect(container).toMatchSnapshot();
});

test("code is shown without highlighting while language is fetching", () => {
  const { container } = renderWithContext(
    <PackagePageReadme
      contents={`
\`\`\`js
const add = (a, b) => a + b;
\`\`\`
`}
    />,
  );

  expect(container).toMatchSnapshot();
});

test("code is shown without syntax highlighting when fetching language fails", () => {
  const { moduleCache, container } = renderWithContext(
    <PackagePageReadme
      contents={`
\`\`\`js
const add = (a, b) => a + b;
\`\`\`
`}
    />,
  );

  act(() => {
    moduleCache.fail(
      languageModules.get("javascript"),
      new Error("fetching failed"),
    );
  });

  expect(container).toMatchSnapshot();
});

test("code is syntax highlighted when fetching language succeeds", async () => {
  const { moduleCache, container } = renderWithContext(
    <PackagePageReadme
      contents={`
\`\`\`js
const add = (a, b) => a + b;
\`\`\`
`}
    />,
  );

  await act(async () => {
    await moduleCache.wait(languageModules.get("javascript"));
  });

  expect(container).toMatchSnapshot();
});

test("html is passed on", () => {
  const { container } = renderWithContext(
    <PackagePageReadme
      contents={`
<p>Hello, world!</p>
`}
    />,
  );

  expect(container).toMatchSnapshot();
});

test("html is protected against xss", () => {
  const { container } = renderWithContext(
    <PackagePageReadme
      contents={`
<script>console.log("MWAHAHA");</script>
`}
    />,
  );

  expect(container).toMatchSnapshot();
});

test("local links are prefixed", () => {
  const { container } = renderWithContext(
    <PackagePageReadme
      repository="https://github.com/user/project"
      contents={`
[local link](local/link)

<a href="local/link">local link</a>
`}
    />,
  );

  expect(container).toMatchSnapshot();
});

test("local images are prefixed", () => {
  const { container } = renderWithContext(
    <PackagePageReadme
      repository="https://github.com/user/project"
      contents={`
![local image](local/image.jpg)

<img alt="local image" src="local/image.jpg" />
`}
    />,
  );

  expect(container).toMatchSnapshot();
});
