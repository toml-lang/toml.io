const path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: './assets/javascripts/application.js',
  mode: process.env.NODE_ENV || 'development',
  output: {
    filename: 'application.js',
    path: path.resolve(__dirname, 'public/javascripts')
  },
  watchOptions: {
    ignored: /node_modules/
  }
};
