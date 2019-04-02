const webpack = require("webpack");
const path = require("path");
const ModuleNotFoundPlugin = require("react-dev-utils/ModuleNotFoundPlugin");
const WatchMissingNodeModulesPlugin = require("react-dev-utils/WatchMissingNodeModulesPlugin");
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

// adapted from https://github.com/smooth-code/loadable-components/blob/3767f28240ffd87676d6e965c649188aedd9d301/packages/webpack-plugin/src/index.js
class AssetManifestPlugin {
  constructor(filename) {
    this.filename = filename;
  }

  apply(compiler) {
    const handleEmit = (hookCompiler, callback) => {
      const stats = hookCompiler.getStats().toJson({
        hash: false,
        publicPath: true,
        assets: true,
        chunks: false,
        modules: false,
        source: false,
        errorDetails: false,
        timings: false,
      });

      const json = JSON.stringify(stats);

      hookCompiler.assets[this.filename] = {
        source: () => json,
        size: () => json.length,
      };

      callback();
    };

    compiler.hooks.emit.tapAsync("nupum", handleEmit);
  }
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
      path: path.join(__dirname, "build"),
      filename: isDev ? "static/[name].js" : "static/[name].[contenthash:8].js",
      chunkFilename: isDev
        ? "static/[name].js"
        : "static/[name].[contenthash:8].js",
      publicPath: "/",
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
      // generate an asset manifest for server use
      new AssetManifestPlugin("assets.json"),
      // environment variables
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(
          isDev ? "development" : "production",
        ),
        "process.env.TARGET": JSON.stringify("client"),
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
      path: path.join(__dirname, "build"),
      filename: "server.js",
    },
    resolve: {
      extensions,
    },
    module: {
      rules,
    },
    plugins: [
      ...createPlugins(),
      // environment variables
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(
          isDev ? "development" : "production",
        ),
        "process.env.TARGET": JSON.stringify("server"),
        "process.env.STATIC_PATH": JSON.stringify(
          path.join(__dirname, "build/static"),
        ),
        "process.env.STATIC_PREFIX": JSON.stringify("/static"),
        "process.env.MANIFEST_PATH": JSON.stringify(
          path.join(__dirname, "build/assets.json"),
        ),
        "process.env.PORT": JSON.stringify(process.env.PORT || "3000"),
      }),
    ],
  },
];
