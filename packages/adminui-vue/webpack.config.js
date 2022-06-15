/**
 * Created by pavel.mash on 2018-07-15
 */
const webpack = require('webpack')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = (options = {}) => ({
  entry: {
    app: './adminui-vue.js'
  },
  output: {
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
      // VueJS uses process.env.NODE_ENV to enable devtools
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    })
  ]
})
