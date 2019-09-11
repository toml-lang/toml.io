const path = require("path");
const FileIncludeWebpackPlugin = require("file-include-webpack-plugin");
const RemovePlugin = require("remove-files-webpack-plugin");

module.exports = {
  devtool: "source-map",
  entry: "./code/javascripts/application.js",
  mode: process.env.NODE_ENV || "development",
  output: {
    filename: "javascripts/application.js",
    path: path.resolve(__dirname, "public")
  },
  plugins: [
    new FileIncludeWebpackPlugin({
      source: "./code/html"
    }),
    new RemovePlugin({
      after: {
        include: ["public/partials"]
      }
    })
  ],
  watchOptions: {
    ignored: /node_modules/
  }
};
