/**
 * Created by pavel.mash on 04.09.2016.
 */
const webpack = require('webpack')
const path = require('path')

// var CircularDependencyPlugin = require('circular-dependency-plugin')

module.exports = {
  entry: {
    app: './adminui.js'
    // vendor: ['bluebird', 'bluebird-q', 'lodash', 'CryptoJS'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'adminui.min.js',
    publicPath: '/clientRequire/@unitybase/adminui-pub/dist/'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        // MPV - IMPORTANT to remove a 'use strict' in boundle, in other case Ext.callParent not work,
        // because in strict mode Fintion.calle in undefined, but this technic in used internalty by Ext.callParent
        presets: ['es2015-without-strict']
      }
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: require.resolve('tinymce/tinymce'),
      loaders: [
        'imports?this=>window',
        'exports?window.tinymce'
      ]
    }, {
      // this option is required for tinyMCE, see https://github.com/tinymce/tinymce/issues/2836
      test: /tinymce[\\/](themes|plugins)[\\/]/,
      loaders: [
        'imports?this=>window'
      ]
    }]
  },
  // devtool: 'eval',
  devtool: 'source-map',
  // devtool: 'cheap-module-source-map',

  plugins: [
    new webpack.DefinePlugin({
      BOUNDLED_BY_WEBPACK: true
    }),

    // new webpack.optimize.CommonsChunkPlugin(/* chunkName= */'vendor', /* filename= */'q-lodash-crypto.min.js'),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'tinymce-boundle',
    //   filename: 'tinymce-boundle.min.js',
    //   minChunks: module => isExternal(module)
    // }),

//    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      // exclude: /a\.js/,
      // add errors to webpack instead of warnings
//      failOnError: true
//    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
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
      },
      output: {
        ascii_only: true // for TinyMCE
      }
    })
  ]
}
