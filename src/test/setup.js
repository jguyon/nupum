const emotionSerializer = require("jest-emotion");
const snapshotDiff = require("snapshot-diff");
const jestDom = require("jest-dom");

expect.addSnapshotSerializer(emotionSerializer);
expect.addSnapshotSerializer(snapshotDiff.getSnapshotDiffSerializer());

expect.extend({
  ...jestDom,
  toMatchDiffSnapshot: snapshotDiff.toMatchDiffSnapshot,
});

process.env.TARGET = "client";
