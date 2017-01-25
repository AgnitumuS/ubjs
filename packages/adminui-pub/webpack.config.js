/**
 * Created by pavel.mash on 04.09.2016.
 */
var webpack = require('webpack')

// var CircularDependencyPlugin = require('circular-dependency-plugin')

function isExternal (module) {
  var userRequest = module.userRequest

  if (typeof userRequest !== 'string') {
    return false
  }

  return userRequest.indexOf('tinymce') >= 0
  // return userRequest.indexOf('bluebird') >= 0 ||
  //   // userRequest.indexOf('/bluebird-q/') >= 0 ||
  //   userRequest.indexOf('lodash') >= 0 ||
  //   userRequest.indexOf('CryptoJS') >= 0
}

module.exports = {
  entry: {
    app: './adminui.js'
	//, vendor: ['bluebird', 'bluebird-q', 'lodash', 'CryptoJS'],
  },
  output: {
    path: __dirname + '/dist',
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
    }]
  },
  // devtool: 'eval',
  devtool: 'source-map',
  // devtool: 'cheap-module-source-map',

  plugins: [
    new webpack.DefinePlugin({
        BOUNDLED_BY_WEBPACK: true
    }),
    /*new webpack.ProvidePlugin({
      'tinymce': '@unitybase/tinymce-with-plugins/dist/tinymce-with-plugins.min.js',
      'tinyMCE': '@unitybase/tinymce-with-plugins/dist/tinymce-with-plugins.min.js'
    }),*/
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
      }
    })

        // new webpack.optimize.CommonsChunkPlugin({
        //     children: true,
        //     async: true,
        // })
  ]
}
