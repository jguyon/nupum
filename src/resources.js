import invariant from "tiny-invariant";
import { createResource } from "./resource-cache";

const NPMS_API = "https://api.npms.io/v2";

export const packageSearch = createResource(
  async ({ query, from = 0, size = 25 }) => {
    invariant(typeof query === "string", "expected query to be a string");
    invariant(typeof from === "number", "expected from to be a number");
    invariant(typeof size === "number", "expected size to be a number");

    const params = new URLSearchParams({
      q: query,
      from,
      size,
    });
    const response = await fetch(`${NPMS_API}/search?${params.toString()}`);

    invariant(
      response.status === 200,
      `expected response status to be 200 but got ${response.status}`,
    );

    return await response.json();
  },
  ({ query, from = 0, size = 25 }) => JSON.stringify([query, from, size]),
);

export const packageInfo = createResource(async name => {
  invariant(typeof name === "string", "expected name to be a string");

  const response = await fetch(
    `${NPMS_API}/package/${encodeURIComponent(name)}`,
  );

  if (response.status === 200) {
    const data = await response.json();

    if (
      !data.collected.metadata.readme &&
      data.collected.metadata.links &&
      data.collected.metadata.links.repository
    ) {
      data.collected.metadata.readme = await fetchGithubReadme(
        data.collected.metadata.links.repository,
      );
    }

    return {
      found: true,
      data,
    };
  } else if (response.status === 404) {
    return {
      found: false,
    };
  } else {
    invariant(
      false,
      `expected response status to be 200 or 404 but got ${response.status}`,
    );
  }
});

async function fetchGithubReadme(repository) {
  let matches;
  if ((matches = repository.match(/^https:\/\/github.com\/([^/]+)\/([^/]+)/))) {
    const org = matches[1];
    const repo = matches[2];

    const response = await fetch(
      `https://raw.githubusercontent.com/${org}/${repo}/master/README.md`,
    );

    if (response.status === 200) {
      return await response.text();
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}
