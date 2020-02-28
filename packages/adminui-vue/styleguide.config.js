const webpack = require('webpack')
const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  pagePerSection: true,
  sections: [
    {
      name: 'Introduction',
      content: 'styleguide-src/docs/introduction.md'
    },
    /*    {
      name: 'Documentation',
      sections: [
        {
          name: 'Installation',
          // content: 'docs/installation.md',
          description: 'The description for the installation section'
        },
        {
          name: 'Configuration'
          // content: 'docs/configuration.md'
        },
        {
          name: 'Live Demo',
          external: true,
          href: 'http://example.com'
        }
      ]
    }, */
    {
      name: 'Css classes'
    },
    {
      name: 'UI Components',
      content: 'styleguide-src/docs/ui-components.md',
      sectionDepth: 1,
      components: [
        './components/controls/UFormContainer.vue',
        './components/controls/UGrid.vue',
        './components/controls/UFormRow.vue',
        './components/controls/UBaseInput.vue',
        './components/controls/UCodeMirror.vue',
        './components/controls/UTable/UTable.vue',
        './components/controls/UDropdown/UDropdown.vue',
        './components/controls/UDropdown/UDropdownItem.vue'
      ]
    },
    {
      name: 'UI Components for metabase',
      content: 'styleguide-src/docs/ui-with-metabase.md',
      sectionDepth: 1,
      components: [
        './components/UAutoField.vue',
        // './components/controls/UInput/UInput.vue',
        // './components/controls/USelectEntity.vue',
        // './components/controls/USelectEnum.vue',
        // './components/controls/USelectMultiple.vue',
        // './components/controls/USelectMany.vue',
        // './components/controls/USelectCollection.vue',
        // './components/controls/UCodeMirror.vue',
        // './components/controls/UFile/UFile.vue',
        // './components/controls/UFile/UFileInput.vue',
        // './components/controls/UFile/UFileCollection.vue',
        // './components/controls/UTableEntity/UTableEntity.vue'
      ]
    }
  ],
  copyCodeButton: true,
  // ignore: ['./components/controls/UFile/UFile.vue', './components/controls/USelectCollection.vue'],
  require: [path.join(__dirname, './styleguide-src/global.requires.js')],
  renderRootJsx: path.join(__dirname, './styleguide-src/styleguide.root.js'),
  webpackConfig: {
    resolve: {
      // extensions: ['.js', '.vue', '.json'],
      alias: {
        // 'vue$': 'vue/dist/vue.common.js', // should be the same as in SystemJS dev config - see adminui-pub/index-dev.mustache
        '@unitybase/adminui-vue': path.resolve(__dirname, './dist/adminui-vue.min.js'),
        '@unitybase/ub-pub': path.resolve(__dirname, '../ub-pub/dist/ub-pub.min.js')
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
          test: /\.css$/,
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
        filename: 'style.css'
      }),
      new webpack.DefinePlugin({
        BOUNDLED_BY_WEBPACK: true,
        // VueJS use process.env.NODE_ENV to enable devtools
        'process.env.NODE_ENV': JSON.stringify('production')
      })
      // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ]
  }
}
