/**
 * Created by pavel.mash on 14.02.2017
 */
const webpack = require('webpack')
const path = require('path')

module.exports = {
  entry: {
    main: path.join(__dirname, 'index.js')
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'ubs.[name].min.js',
    publicPath: '/clientRequire/@unitybase/ubs/public/dist/',
    library: 'unitybase_ubs',
    libraryTarget: 'var'
  },
  externals: {
    lodash: '_',
    '@unitybase/ub-pub': 'UB',
    '@unitybase/adminui-pub': '$App'
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: [/node_modules/],
      query: {
        // MPV - IMPORTANT to remove a 'use strict' in boundle, in other case Ext.callParent not work,
        // because in strict mode Fintion.calle in undefined, but this technic in used internalty by Ext.callParent
        presets: ['es2015-without-strict']
      }
    }, {
      test: /\.css$/,
      use: [
        { loader: 'style-loader' },
        { loader: 'css-loader' }
      ]
    }, {
      // jsPDF use a zlib.js which does not export. Let's fix it
      test: /zlib/,
      use: 'exports-loader?DecodeStream,FlateStream'
      // adds below code the file's source:
      //  exports["DecodeStream"] = DecodeStream;
      //  exports["FlateStream"] = FlateStream;
    }]
  },
  // devtool: 'source-map',

  plugins: [
    new webpack.DefinePlugin({
      BOUNDLED_BY_WEBPACK: true
    }),
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
