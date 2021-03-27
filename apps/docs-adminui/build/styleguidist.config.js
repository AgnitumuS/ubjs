const path = require('path')
const { version } = require('@unitybase/adminui-vue/package.json')

/**
 * Return relative component path
 *
 * @param {string} absolutePath
 * @returns {string}
 */
function c (absolutePath) {
  return `../node_modules/@unitybase/adminui-vue/components/${absolutePath}`
}

// without sets a mode in webpack config we always get a production build
const webpackMode = process.env.NODE_ENV !== 'development' ? 'production' : 'development'
const webpackConfig = require('./webpack.config')
webpackConfig.mode = webpackMode

module.exports = {
  title: '@unitybase/adminui-vue',
  version,
  /**
   * Enabling the following option splits sections into separate views.
   */
  pagePerSection: true,
  // TODO: add packages/adminui-vue/utils/Form/README.md
  sections: [{
    name: 'Getting Started',
    content: '../docs/getting-started-adminui-vue.md'
  }, {
    name: 'Theme (colors & icons)',
    content: '../docs/colors-and-icons.md'
  }, {
    name: 'App shell ($App)',
    usageMode: 'expand', // expand props, methods and events
    exampleMode: 'expand', // expand example source
    sectionDepth: 2,
    sections: [{
      name: 'Show list',
      content: '../docs/show-list.md'
    }]
  }, {
    name: 'Layout',
    usageMode: 'expand',
    exampleMode: 'expand',
    sectionDepth: 2,
    components: [
      c('controls/UFormRow.vue'), // TODO
      c('controls/UGrid.vue'), // TODO
    ]
  }, {
    name: 'Presentational',
    usageMode: 'expand', // expand props, methods and events
    exampleMode: 'expand', // expand example source
    sectionDepth: 2, // use separate page for each 2-d level menu items (each component)
    components: [
      c('controls/UIcon.vue'), // TODO
      c('controls/UButton.vue'),
      c('controls/UButtonGroup.vue'),
      c('controls/UBaseInput.vue'),
      c('controls/UFile/UFileInput.vue'),
      c('controls/UTable/UTable.vue'), // TODO
      c('controls/UDatePicker.vue'), // TODO
      c('controls/UDropdown/UDropdown.vue'), // TODO
      c('controls/UDropdown/UDropdownItem.vue') // TODO
    ]
  }, {
    name: 'Data-aware',
    usageMode: 'expand',
    exampleMode: 'expand',
    sectionDepth: 2,
    components: [
      c('controls/UInput/UInput.vue'), // TODO
      c('controls/UFile/UFile.vue'), // TODO
      c('controls/UFile/UFileMultiple.vue'), // TODO
      c('controls/UFile/UFileCollection.vue'), // TODO
      c('UTableEntity/UTableEntity.vue'), // TODO
      c('controls/USelectEntity.vue'), // TODO
      c('controls/USelectEnum.vue'), // TODO
      c('controls/USelectMultiple.vue'), // TODO
      c('controls/USelectMany.vue'), // TODO
      c('controls/USelectCollection.vue') // TODO
    ]
  }, {
    name: 'Views',
    usageMode: 'expand',
    exampleMode: 'expand',
    sectionDepth: 2,
    components: [
      c('UToolbar/UToolbar.vue'), // TODO
      c('UMasterDetailView/UMasterDetailView.vue') // TODO
    ]
  }],

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
  webpackConfig: webpackConfig,

  styleguideDir: '../inetpub',

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
