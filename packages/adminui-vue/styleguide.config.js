const webpack = require('webpack')
const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const {InjectManifest} = require('workbox-webpack-plugin')

module.exports = {
  components: [
    // './components/UAutoField.vue',

    // './components/controls/UDropdown/UDropdownItem.vue',
    // './components/controls/UDropdown/UDropdown.vue',
    // './components/controls/UFile/UFileCollection.vue',
    // './components/controls/UFile/UFileInput.vue',
    // './components/controls/UFile/UFile.vue',
    // './components/controls/UInput/LocaleButton.vue',
    // './components/controls/UInput/UInput.vue',
    // './components/controls/UTable/UTable.vue',
    //
    './components/controls/USelectEntity.vue',
    // './components/controls/USelectEnum.vue',
    // './components/controls/USelectMany.vue',
    // './components/controls/UUploadDocument.vue',
    // './components/controls/UCodeMirror.vue',
    // './components/controls/UInput/index.vue',
    // './components/controls/UForm/index.js',
    // './components/controls/UFormRow.vue',
    // './components/UToolbar/UToolbar.vue'
  ],
  // ignore: ['./components/controls/UFile/UFile.vue', './components/controls/USelectCollection.vue'],
  require: [path.join(__dirname, './styleguide-src/global.requires.js')],
  renderRootJsx: path.join(__dirname, './styleguide-src/styleguide.root.js'),
  webpackConfig: {
    resolve: {
      // extensions: ['.js', '.vue', '.json'],
      alias: {
        '@unitybase/adminui-vue': path.resolve(__dirname, '.'),
        '@unitybase/ub-pub': path.resolve(__dirname, '../ub-pub')
        //   vue$: 'vue/dist/vue.common.js' // should be the same as in SystemJS dev config - see adminui-pub/index-dev.mustache
      }
    },
    module: {
      rules: [
        {
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
        'process.env.NODE_ENV': JSON.stringify('develop')
      }),
      new InjectManifest({
        swSrc: './styleguide-src/service-worker.min.js',
        swDest: 'service-worker.js'
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
}
