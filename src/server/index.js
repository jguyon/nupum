import express from "express";
import serveStatic from "serve-static";
import React from "react";
import { renderToString, renderToStaticMarkup } from "react-dom/server";
import fs from "fs";
import util from "util";
import invariant from "tiny-invariant";
import App from "../app";
import Document from "./document";

const app = express();

app.use(process.env.STATIC_PREFIX, serveStatic(process.env.STATIC_PATH));

app.get("/*", async (req, res) => {
  try {
    const scripts = await scriptsFor("main");
    const appHtml = renderToString(<App />);
    const html = renderToStaticMarkup(
      <Document html={appHtml} scripts={scripts} />,
    );

    res
      .status(200)
      .set("content-type", "text/html")
      .send(`<!doctype html>${html}`);
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .set("content-type", "text/plain")
      .send("Internal Server Error");
  }
});

app.listen(process.env.PORT, () => {
  console.info(`Listening on http://localhost:${process.env.PORT}`);
});

const JS_REGEXP = /\.js$/;
async function scriptsFor(entry, chunks = []) {
  const manifest = await readManifest();
  const scripts = new Set();

  const processAsset = asset => {
    if (JS_REGEXP.test(asset)) {
      scripts.add(`${manifest.publicPath}${asset}`);
    }
  };

  chunks.forEach(chunk => {
    const chunkGroup = manifest.namedChunkGroups[chunk];
    invariant(chunkGroup, `invalid chunk name ${JSON.stringify(chunk)}`);
    chunkGroup.assets.forEach(processAsset);
  });

  const entrypoint = manifest.entrypoints[entry];
  invariant(entrypoint, `invalid entry name ${JSON.stringify(entry)}`);
  entrypoint.assets.forEach(processAsset);

  return [...scripts];
}

const readFile = util.promisify(fs.readFile);
let cachedManifest = null;
async function readManifest() {
  if (cachedManifest) {
    return cachedManifest;
  }

  const contents = await readFile(process.env.MANIFEST_PATH);
  const manifest = JSON.parse(contents.toString());

  if (!__DEV__) {
    cachedManifest = manifest;
  }

  return manifest;
}
