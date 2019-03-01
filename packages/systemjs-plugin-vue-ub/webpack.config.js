/**
 * Created by pavel.mash on 2018-07-15
 */
const webpack = require('webpack')
const path = require('path')

module.exports = {
  entry: {
    app: './index.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    library: 'unitybase_system_plugin_vue_ub',
    libraryTarget: 'umd',
    filename: 'system_plugin_vue_ub.min.js',
    publicPath: '/clientRequire/@unitybase/systemjs-plugin-vue-ub/dist/'
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
      exclude: [/node_modules/]
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
  plugins: [
    new webpack.DefinePlugin({
      BOUNDLED_BY_WEBPACK: true,
      'process.env.NODE_ENV': JSON.stringify('production')
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
