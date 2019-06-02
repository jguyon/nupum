module.exports = {
  presets: [
    // Activating absoluteRuntime creates a variable which contains an absolute
    // path, which means the contents of files are different on different
    // machines and therefore create different file hashes.
    ["react-app", { absoluteRuntime: false }],
    // Similarly, activating sourceMap also produces different files on
    // different machines which leads to the same problem.
    // Additionally, they produce dom mismatches because the generated classes
    // are not the same in the client build and the server build.
    ["@emotion/babel-preset-css-prop", { sourceMap: false }],
  ],
  plugins: [
    "babel-plugin-dev-expression",
    process.env.NODE_ENV !== "test" && "babel-plugin-jsx-remove-data-test-id",
  ].filter(Boolean),
};
