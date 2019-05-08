import "./polyfill";
import React from "react";
import { renderToString, renderToStaticMarkup } from "react-dom/server";
import invariant from "tiny-invariant";
import { createStaticHistory } from "../router";
import { createServerModuleCache } from "../module-cache";
import { createServerResourceCache } from "../resource-cache";
import * as resources from "../resources";
import App, { preloadApp } from "../app";
import Document from "./document";

const HTML_PREFIX = "<!doctype html>";
const SERVER_ERROR_TEXT = "Internal Server Error";

export default async function handle(req, res) {
  try {
    const history = createStaticHistory(req.url);
    const moduleCache = createServerModuleCache();
    const resourceCache = createServerResourceCache(resources);

    await preloadApp({ history, moduleCache, resourceCache });

    const scripts = scriptsFor("main", moduleCache.chunks());
    const data = resourceCache.serialize();
    const appHtml = renderToString(
      <App
        history={history}
        moduleCache={moduleCache}
        resourceCache={resourceCache}
      />,
    );
    const html = renderToStaticMarkup(
      <Document html={appHtml} scripts={scripts} data={data} />,
    );

    res.writeHead(history.statusCode || 200, {
      "content-type": "text/html",
      "content-length":
        Buffer.byteLength(HTML_PREFIX) + Buffer.byteLength(html),
    });
    res.write(HTML_PREFIX);
    res.end(html);
  } catch (error) {
    console.error(`error at ${req.url}:`, error);

    res.writeHead(500, {
      "content-type": "text/plain",
      "content-length": Buffer.byteLength(SERVER_ERROR_TEXT),
    });
    res.end(SERVER_ERROR_TEXT);
  }
}

const manifest = require(process.env.MANIFEST_PATH);

function scriptsFor(entry, chunks) {
  const scripts = new Set();

  for (const chunk of chunks) {
    const chunkGroup = manifest.namedChunkGroups[chunk];
    invariant(chunkGroup, `invalid chunk name ${JSON.stringify(chunk)}`);
    for (const asset of chunkGroup.assets) {
      addAsset(scripts, asset);
    }
  }

  const entrypoint = manifest.entrypoints[entry];
  invariant(entrypoint, `invalid entry name ${JSON.stringify(entry)}`);
  for (const asset of entrypoint.assets) {
    addAsset(scripts, asset);
  }

  return [...scripts];
}

const JS_REGEXP = /\.js$/;
function addAsset(scripts, asset) {
  if (JS_REGEXP.test(asset)) {
    scripts.add(`${manifest.publicPath}${asset}`);
  }
}
