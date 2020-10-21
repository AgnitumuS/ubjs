/* global SystemJS */
const { parseComponent, compileToFunctions } = require('vue-template-compiler/browser.js')

/**
 * Parse *.vue files
 *  - extract `style` part and inject into DOM
 *  - extract `template` part, compile it into function and inject into page as SystemJS module
 *  - in case template exists - adds to property to module.exports: render and staticRenderFns - compled render functions
 * @param {Object} load
 * @param {string} load.name Module name
 * @param {string} load.source Module source
 * @param opts
 * @returns {string}
 */
exports.translate = function (load, opts) {
  return compile(load, opts || {}, this.vue || {})
}

function compile (load, opts, vueOpts) {
  // parse Vue Singe File component (SFC)
  const {
    styles,
    script = {
      content: 'module.exports.default = {}'
    },
    template
  } = parseComponent(load.source, { pad: 'space' })
  // extract styles and inject it into DCM
  const hasScoped = styles.some(s => s.scoped)
  if (hasScoped) console.error('Scoped style not supported. Use BEM and CSS variables')

  if (styles.length) {
    const styleTag = document.createElement('style')
    styleTag.textContent = styles
      .map(s => s.content.trim())
      .join('\n')
    document.head.appendChild(styleTag)
  }
  // script block: transform `export default` & `module.exports` into `module.exports.default`
  const scriptContent = script.content
    .replace(/export default/, 'module.exports.default =')
    .replace(/(module\.exports =)/, 'module.exports.default =')

  if (template) {
    // in case template block exists - compile it to functions and put intoSystemS registry as module
    const templateModuleName = getTemplateModuleName(load.name)
    SystemJS.set(templateModuleName, SystemJS.newModule(
      compileToFunctions(template.content)
    ))
    // MPV TODO use something like falafel to to parse AST and replace exports gracefully
    return `var __renderFns__ = SystemJS.get(${JSON.stringify(templateModuleName)});` + scriptContent.replace(
      /module\.exports\.default = {/,
      'module.exports.default = {render:__renderFns__.render,' +
      'staticRenderFns:__renderFns__.staticRenderFns,'
    )
  }

  return scriptContent
}

function getTemplateModuleName (name) {
  if (SystemJS.getCanonicalName) {
    name = SystemJS.getCanonicalName(name)
  }
  return name + '.template'
}
