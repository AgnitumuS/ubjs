// Created by pavel.mash on 04.09.2016.

const webpack = require('webpack')
const path = require('path')

module.exports = {
  entry: './ub-pub.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ub-pub.min.js',
    library: 'UB',
    libraryTarget: 'umd'
  },
  externals: {
    'lodash': {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
      root: '_'
    }
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
  devtool: 'cheap-source-map',

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        unused: false, // true
        warnings: true, // false,
        drop_console: false, // true,
        unsafe: true
      },
      output: {
        comments: false
      },
      sourceMap: process.env.NODE_ENV !== 'production'
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ]
}
