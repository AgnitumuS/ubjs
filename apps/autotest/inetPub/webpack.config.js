/**
 * Created by pavel.mash on 04.09.2016.
 */
var webpack = require('webpack')

module.exports = {
  entry: {
    app: './app.js'
  },
  output: {
    path: './',
    filename: 'app.min.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: ['es2015']
      }
    }]
  },
  devtool: 'source-map',

  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
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
    })
  ]
}
