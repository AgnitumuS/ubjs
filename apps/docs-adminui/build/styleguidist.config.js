const path = require('path')
const version = require('../node_modules/@unitybase/adminui-vue/package.json').version

/**
 * Return component path
 * @param cpm
 */
function c (cmp) {
  return `../../../packages/adminui-vue/components/${cmp}`
}

module.exports = {
  title: '@unitybase/adminui-vue',
  version: version,
  /**
   * Enabling the following option splits sections into separate views.
   */
  pagePerSection: true,
  sections: [{
    name: 'Getting Started',
    content: '../docs/getting-started-adminui-vue.md'
  }, {
    name: 'Theme (colors & icons)',
    content: '../docs/colors-and-icons.md'
  }, {
    name: 'Presentational',
    usageMode: 'expand', // expand props, methods and events
    exampleMode: 'expand', // expand example source
    sectionDepth: 2, // use separate page for each 2-d level menu items (each component)
    components: [
      c('controls/UIcon.vue'), // TODO
      c('controls/UButton.vue'),
      c('controls/UFile/UFileInput.vue')
    ]
  }, {
    name: 'Data-aware',
    usageMode: 'expand',
    exampleMode: 'expand',
    sectionDepth: 2,
    components: [
      c('controls/UInput/UInput.vue'), // TODO
      c('controls/UFile/UFile.vue'), // TODO
      c('controls/USelectEntity.vue'), // TODO
      c('UTableEntity/UTableEntity.vue') // TODO
    ]
  }, {
    name: 'Views',
    usageMode: 'expand',
    exampleMode: 'expand',
    sectionDepth: 2,
    components: [
      // TODO
    ]
  }
    // TODO - where to place this tutorial?
    //   {
    //   name: 'UB command: Show list',
    //   content: '../docs/show-list.md'
    // },
  ],

  theme: {
    maxWidth: '1440px',
    sidebarWidth: 280,
    fontFamily: {
      base: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      monospace: ['Consolas', "'Liberation Mono'", 'Menlo', 'monospace']
    }
  },
  /**
   * Define a custom code highlighting theme.
   */
  // editorConfig: {
  //   theme: 'night'
  // },

  require: [
    // inject UB and element theme css
    path.join(__dirname, './globalRequires'),
    path.join(__dirname, './fix-ub-style.css')
  ],
  renderRootJsx: path.join(__dirname, './eachRender'),
  webpackConfig: require('./webpack.config'),

  styleguideDir: '../public/docs-adminui',

  compilerConfig: {
    objectAssign: 'Object.assign',
    transforms: {
      // make async/await work by default (no transforms)
      asyncAwait: false,
      forOf: false
    }
  },
  getComponentPathLine: () => '' // remove component path example - all components already registered in Vue prototype
}