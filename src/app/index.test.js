import React from "react";
import { createMemoryHistory } from "history";
import { createTestModuleCache } from "../module-cache";
import { createTestResourceCache } from "../resource-cache";
import { packageSearch, packageInfo } from "../resources";
import { render, fireEvent, act } from "../test/react";
import { fakePackageSearch, fakePackageInfo } from "../test/fake";
import App from ".";

test("searching for a package works", async () => {
  const history = createMemoryHistory();
  const moduleCache = createTestModuleCache();
  const resourceCache = createTestResourceCache();
  const { getByLabelText, getByText, container } = render(
    <App
      history={history}
      moduleCache={moduleCache}
      resourceCache={resourceCache}
    />,
  );

  fireEvent.change(getByLabelText("Search query"), {
    target: { value: "react" },
  });
  fireEvent.click(getByLabelText("Search"));

  await act(async () => {
    await moduleCache.waitAll();
    resourceCache.succeed(
      packageSearch,
      { query: "react", from: 0, size: 10 },
      { ...fakePackageSearch({ size: 10 }), total: 30 },
    );
  });

  fireEvent.click(getByLabelText("Next page"));

  const searchResults = { ...fakePackageSearch({ size: 10 }), total: 30 };
  act(() => {
    resourceCache.succeed(
      packageSearch,
      { query: "react", from: 10, size: 10 },
      searchResults,
    );
  });

  const packageName = searchResults.results[1].package.name;
  fireEvent.click(getByText(packageName));

  await act(async () => {
    await moduleCache.waitAll();
    const info = fakePackageInfo();
    resourceCache.succeed(packageInfo, packageName, {
      found: true,
      data: {
        ...info,
        collected: {
          ...info.collected,
          metadata: {
            ...info.collected.metadata,
            readme: "This is the package readme.",
          },
        },
      },
    });
  });

  expect(history.location.pathname).toBe(`/package/${packageName}`);
  expect(container).toHaveTextContent("This is the package readme.");
});
