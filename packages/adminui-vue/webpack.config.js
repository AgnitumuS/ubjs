/**
 * Created by pavel.mash on 2018-07-15
 */
const webpack = require('webpack')
const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = (options = {}) => ({
  entry: {
    app: './adminui-vue.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    library: 'unitybase_adminui_vue',
    libraryTarget: 'var',
    filename: 'adminui-vue.min.js',
    publicPath: '/clientRequire/@unitybase/adminui-vue/dist/'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.common.js' // should be the same as in SystemJS dev config - see adminui-pub/index-dev.mustache
    }
  },
  externals: {
    lodash: '_',
    '@unitybase/ub-pub': 'UB',
    '@unitybase/adminui-pub': '$App'
  },
  module: {
    rules: [{
      test: /\.vue$/,
      use: ['vue-loader']
    },
    {
      test: /\.js$/,
      use: ['babel-loader'],
      exclude: /node_modules/
    },
    {
      test: /\.css$/,
      use: [{
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
      }]
    }]
  },

  devtool: options.dev ? '#eval-source-map' : '#source-map',

  plugins: [
    new webpack.DefinePlugin({
      BOUNDLED_BY_WEBPACK: true,
      // VueJS use process.env.NODE_ENV to enable devtools
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new UglifyJsPlugin({
      'uglifyOptions': {
        compress: {
          warnings: false
        },
        output: {
          comments: false
        },
        sourceMap: options.dev
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
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
})
