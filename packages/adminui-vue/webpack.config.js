/**
 * Created by pavel.mash on 2018-07-15
 */
const webpack = require('webpack')
const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const WebfontPlugin = require('webfont-webpack-plugin').default

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
      vue$: 'vue/dist/vue.common.js' // should be the same as in SystemJS dev config - see adminui-pub/index-dev.mustache
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
      loader: 'vue-loader'
    },
    {
      test: /\.js$/,
      use: ['babel-loader'],
      exclude: /node_modules/
    },
    {
      test: /\.css$/, // results css are injected inside adminui-vue.js using UB.inject
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader'
      ]
    },
    {
      test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'fonts/'
        }
      }]
    }]
  },

  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: 'adminui-vue.css'
    }),
    new webpack.DefinePlugin({
      BOUNDLED_BY_WEBPACK: true,
      // VueJS use process.env.NODE_ENV to enable devtools
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new WebfontPlugin({
      files: path.resolve(__dirname, './icons/*.svg'),
      dest: path.resolve(__dirname, './theme/icons'),
      template: 'css',
      fontName: 'ub-icons',
      templateClassName: 'u',
      fontHeight: 1001
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
