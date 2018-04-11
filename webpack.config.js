var path = require('path');

module.exports = {
  entry: './entry.js',
  output: {
    filename: './script.js',
  },
  module: {
    loaders: [
      {
        test: /\.worker\.js$/,
        exclude: /(node_modules)/,
        loader: 'worker!babel?presets[]=env',
      },
    ],
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '*'],
  },
};
