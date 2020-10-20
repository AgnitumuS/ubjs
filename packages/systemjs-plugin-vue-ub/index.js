/* global SystemJS */
const { parseComponent, compileToFunctions } = require('vue-template-compiler/browser.js')
const EXPORTS_RE = /module\.exports\.default = {/

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
      content: ''
    },
    template
  } = parseComponent(load.source, { pad: 'space' })
  // extract styles and inject it into DCM
  const hasScoped = sfc.styles.some(s => s.scoped)
  if (hasScoped) console.error('Scoped style not supported. Use BEM and CSS variables')

  if (styles.length) {
    const styleTag = document.createElement('style')
    styleTag.textContent = styles
      .map(s => s.content.trim())
      .join('\n')
    document.head.appendChild(styleTag)
  }
  // script block: transform `export default` & `module.exports` into `module.exports.default`
  let script1 = script.content
    .replace(/export default/, 'module.exports.default =')
    .replace(/(module\.exports =)/, 'module.exports.default =')

  if (template) {
    // in case template block exists - compile it to functions and put intoSystemS registry as module
    const templateModuleName = getTemplateModuleName(load.name)
    SystemJS.set(templateModuleName, SystemJS.newModule(
      compileToFunctions(template.content)
    ))
    // MPV TODO use something like falafel to to parse AST and replace exports gracefully
    script1 = script1 || 'module.exports.default = {}'
    if (!EXPORTS_RE.test(script1)) {
      const msg = `Invalid "script" section for ${load.address}
In UB script section of vue component should contains "module.exports.default = {" or "export default {" phrase`
      console.error(msg)
    }
    script1 = script1.replace(EXPORTS_RE,
      'module.exports.default = {render:__renderFns__.render,' +
      'staticRenderFns:__renderFns__.staticRenderFns,'
    )
    script1 = `var __renderFns__ = SystemJS.get(${JSON.stringify(templateModuleName)});` + script1
  }
  return script1
}

function getTemplateModuleName (name) {
  if (SystemJS.getCanonicalName) {
    name = SystemJS.getCanonicalName(name)
  }
  return name + '.template'
}
