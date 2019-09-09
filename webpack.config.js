const path = require("path");
const FileIncludeWebpackPlugin = require("file-include-webpack-plugin");
const RemovePlugin = require("remove-files-webpack-plugin");

module.exports = {
  devtool: "source-map",
  entry: "./code/javascripts/application.js",
  mode: process.env.NODE_ENV || "development",
  output: {
    filename: "application.js",
    path: path.resolve(__dirname, "public/javascripts")
  },
  plugins: [
    new FileIncludeWebpackPlugin({
      source: "./code/html",
      destination: ".."
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
