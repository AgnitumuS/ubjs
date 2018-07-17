/**
 * Created by pavel.mash on 2018-07-15
 */
const webpack = require('webpack')
const path = require('path')

/**
 Set NODE_ENV=production for production build
 */
if (process.env.NODE_ENV) process.env.NODE_ENV = process.env.NODE_ENV.trim()
const PRODUCTION = (process.env.NODE_ENV === 'production')

module.exports = {
  entry: {
    app: './adminui-next.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    library: 'unitybase_adminui_next',
    libraryTarget: 'var',
    filename: 'adminui-next.min.js',
    publicPath: '/clientRequire/@unitybase/adminui-next/dist/'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.min.js'
    }
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
        {
          loader: 'style-loader/url',
          options: {
            hmr: false
          }
        },
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]'
          }
        }
      ]
    }]
  },
  // devtool: 'eval',
  // devtool: 'source-map',
  // devtool: 'cheap-module-source-map',
  devtool: (PRODUCTION ? 'cheap-source-map' : 'eval'),

  plugins: [
    new webpack.DefinePlugin({
      BOUNDLED_BY_WEBPACK: true,
      'process.env.NODE_ENV': JSON.stringify('production')
    }),

    new webpack.optimize.CommonsChunkPlugin({
      children: true
    }),
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      comments: false,
      'screw-ie8': true,
      sourceMap: !PRODUCTION,
      compress: PRODUCTION
        ? {
          sequences: true,
          booleans: true,
          loops: true,
          unused: false, // true
          warnings: !PRODUCTION, // false,
          drop_console: false, // true,
          unsafe: true
        }
        : false,
      output: {
        ascii_only: true // for TinyMCE
      }
    })
  ],
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
