const path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: './assets/javascripts/application.js',
  mode: process.env.NODE_ENV || 'development',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public/javascripts')
  }
};
