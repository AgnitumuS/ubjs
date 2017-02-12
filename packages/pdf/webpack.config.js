/**
 * Created by pavel.mash on 10.02.2017
 */
const webpack = require('webpack')
const path = require('path')

// var CircularDependencyPlugin = require('circular-dependency-plugin')

module.exports = {
  entry: {
    app: './index.js'
    // vendor: ['bluebird', 'bluebird-q', 'lodash', 'CryptoJS'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'pdf.min.js',
    publicPath: '/clientRequire/@unitybase/pdf/dist/'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: ['es2015']
      }
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }]
  },
  // devtool: 'eval',
  devtool: 'source-map',
  // devtool: 'cheap-module-source-map',

  plugins: [
    new webpack.DefinePlugin({
      BOUNDLED_BY_WEBPACK: true
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin()/*,
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      comments: false,
      'screw-ie8': true,
      // compress: false
      compress: {
        sequences: true,
        booleans: true,
        loops: true,
        unused: false, // true
        warnings: true, // false,
        drop_console: false, // true,
        unsafe: true
      }
    }) */
  ]
}
