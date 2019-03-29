const path = require("path");
const ModuleNotFoundPlugin = require("react-dev-utils/ModuleNotFoundPlugin");
const WatchMissingNodeModulesPlugin = require("react-dev-utils/WatchMissingNodeModulesPlugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const nodeExternals = require("webpack-node-externals");

const isDev = process.env.NODE_ENV !== "production";

const mode = isDev ? "development" : "production";
const devtool = isDev ? "cheap-module-source-map" : "source-map";
const bail = !isDev;
const extensions = [".js"];

const rules = [
  // first, lint javascript files with eslint
  {
    test: /\.js$/,
    enforce: "pre",
    include: path.join(__dirname, "src"),
    loader: require.resolve("eslint-loader"),
    options: {
      formatter: require.resolve("react-dev-utils/eslintFormatter"),
    },
  },
  // process javascript files with babel
  {
    test: /\.js$/,
    oneOf: [
      // process project files
      {
        include: path.join(__dirname, "src"),
        loader: require.resolve("babel-loader"),
        options: {
          cacheDirectory: true,
          cacheCompression: !isDev,
          compact: !isDev,
        },
      },
      // process dependencies
      {
        exclude: /@babel(?:\/|\\{1,2})runtime/,
        loader: require.resolve("babel-loader"),
        options: {
          babelrc: false,
          configFile: false,
          compact: false,
          presets: [
            [
              require.resolve("babel-preset-react-app/dependencies"),
              { helpers: true },
            ],
          ],
          cacheDirectory: true,
          cacheCompression: !isDev,
          sourceMaps: false,
        },
      },
    ],
  },
];

function createPlugins() {
  return [
    // give more context to module not found errors
    new ModuleNotFoundPlugin(__dirname),
    // handle `npm install` of a missing module while in watch mode sensibly
    isDev &&
      new WatchMissingNodeModulesPlugin(path.join(__dirname, "node_modules")),
  ].filter(Boolean);
}

module.exports = [
  {
    name: "client",
    target: "web",
    mode,
    devtool,
    bail,
    entry: path.join(__dirname, "src/client"),
    output: {
      path: path.join(__dirname, "build/client"),
      filename: isDev ? "[name].js" : "[name].[contenthash:8].js",
      chunkFilename: isDev ? "[name].js" : "[name].[contenthash:8].js",
      publicPath: "/static/",
    },
    optimization: {
      runtimeChunk: "single",
      splitChunks: {
        chunks: "all",
      },
    },
    resolve: {
      extensions,
    },
    module: {
      rules,
    },
    plugins: [
      ...createPlugins(),
      // generate a mapping of all assets to their corresponding output path
      new ManifestPlugin({
        // save as a dotfile so that it can be ignored by serve-static
        fileName: ".manifest.json",
      }),
    ],
  },
  {
    name: "server",
    target: "node",
    externals: [nodeExternals()],
    mode,
    devtool,
    bail,
    entry: path.join(__dirname, "src/server"),
    output: {
      path: path.join(__dirname, "build/server"),
      filename: "[name].js",
      chunkFilename: "[name].js",
    },
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
    resolve: {
      extensions,
    },
    module: {
      rules,
    },
    plugins: createPlugins(),
  },
];
