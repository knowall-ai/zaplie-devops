const path = require("path");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const plugins = [];

// Only enable bundle analyzer when ANALYZE env var is set
if (process.env.ANALYZE) {
  plugins.push(
    new BundleAnalyzerPlugin({
      openAnalyzer: false,
      reportFilename: "bundle-analysis.html",
      analyzerMode: "static",
    })
  );
}

module.exports = {
  entry: {
    zapAction: "./scripts/zapAction.tsx",
    settings: "./scripts/settings.tsx",
  },
  output: {
    libraryTarget: "amd",
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  externals: [
    {
      q: true,
      // Note: React 18 is bundled, not using host's React 16
    },
    /^TFS\//, // Ignore TFS/* since they are coming from VSTS host
    /^VSS\//, // Ignore VSS/* since they are coming from VSTS host
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  devtool: "source-map",
  plugins,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
