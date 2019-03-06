/* global SystemJS */
// var fs = {}
var vueCompiler = require('vue-template-compiler/browser.js')
// var falafel = require('falafel')
// var rewriteCSS = requir e('./lib/style-rewriter.js')
// var genId = require('./lib/gen-id.js')
var defaultLangs = require('./lib/langs/index.js')
var normalizeImport = require('./lib/normalize-import')

exports.translate = function (load, opts) {
  opts = opts || {}
  // if (fs.existsSync && fs.existsSync('vue.config.js')) {
  //   return normalizeImport('vue.config.js').then(vueOpts => {
  //     return compile(load, opts, vueOpts)
  //   })
  // } else {
  return compile(load, opts, this.vue || {})
  // }
}

function compile (load, opts, vueOpts) {
  var langs = Object.assign({}, defaultLangs, vueOpts.compilers)
  var sfc = load.metadata.sfc = vueCompiler.parseComponent(load.source, { pad: true })
  // normalize potential custom compilers
  var normalizeLangs = Object.keys(langs).map(lang => normalizeImport(langs[lang]))
  return Promise.all(normalizeLangs).then(() => {
    // resolve lang="xxx" for all parts
    var langsPromises = []
    var scriptCompiler = sfc.script && sfc.script.lang && langs[sfc.script.lang]
    if (scriptCompiler) {
      langsPromises.push(scriptCompiler(sfc.script.content, load.name, vueOpts).then(script => {
        sfc.script.content = script
      }))
    }
    var templateCompiler = sfc.template && sfc.template.lang && langs[sfc.template.lang]
    if (templateCompiler) {
      langsPromises.push(templateCompiler(sfc.template.content, load.name, vueOpts).then(template => {
        sfc.template.content = template
      }))
    }
    sfc.styles.forEach((s, i) => {
      var compiler = s.lang && langs[s.lang]
      if (compiler) {
        langsPromises.push(compiler(s.content, load.name, vueOpts).then(css => {
          sfc.styles[i].content = css
        }))
      }
    })
    return Promise.all(langsPromises)
  }).then(() => {
    // style
    var hasScoped = sfc.styles.some(s => s.scoped)
    if (hasScoped) console.error('Scoped style not supported. Use BEM')
    // var scopeId = hasScoped ? 'data-v-' + genId(load.name) : null
    if (sfc.styles.length) {
      var style = Promise.all(sfc.styles.map(s => {
      // Original: return rewriteCSS(scopeId, s, load.name, opts.minify, vueOpts)
        return s.content.trim()
      })).then(compiledStyles => {
        return compiledStyles.join('\n')
      })
      if (typeof window !== 'undefined') {
        style.then(injectStyle)
      } else {
        load.metadata.vueStyle = style
      }
    }
    var templateModuleName = getTemplateModuleName(load.name)
    // in-browser template handling
    if (typeof window !== 'undefined' && sfc.template) {
      SystemJS.set(templateModuleName, SystemJS.newModule(
        vueCompiler.compileToFunctions(sfc.template.content)
      ))
    }
    // script
    let script = sfc.script ? sfc.script.content : ''
    script = script.replace(/export default/, 'module.exports.default =')
    script = script.replace(/(module\.exports =)/,
      `module.exports.default =`)
    if (sfc.template) {
      const EXPORTS_RE = /module\.exports\.default = {/
      // MPV falafel require acron and it's buggy, so lets do a simple parsing
      script = script || 'module.exports.default = {}'
      if (!EXPORTS_RE.test(script)) {
        let msg = `Invalid "script" section for ${load.address}
In UB script section of vue component should contains "module.exports.default = {" or "export default {" phrase`
        console.error(msg)
      }
      script = script.replace(EXPORTS_RE,
        `module.exports.default = {render:__renderFns__.render,` +
        `staticRenderFns:__renderFns__.staticRenderFns,`
      )
      script = `var __renderFns__ = SystemJS.get(${JSON.stringify(templateModuleName)});` + script
    }
    return script
  })
}

var cssInject = "(function(c){if (typeof document == 'undefined') return; var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})"
if (typeof window === 'undefined') {
  exports.bundle = function (loads) {
    var style = Promise.all(
      loads
        .map(load => load.metadata.vueStyle)
        .filter(s => s)
    ).then(styles => {
      return `${cssInject}(${JSON.stringify(styles.join('\n'))});\n`
    })

    var templateModules = loads
      .filter(l => l.metadata.sfc.template)
      .map(l => compileTemplateAsModule(l.name, l.metadata.sfc.template.content))
      .join('\n')

    return style.then(style => templateModules + '\n' + style)
  }
}

function injectStyle (style) {
  var styleTag = document.createElement('style')
  styleTag.textContent = style
  document.head.appendChild(styleTag)
}

function getTemplateModuleName (name) {
  if (SystemJS.getCanonicalName) {
    name = SystemJS.getCanonicalName(name)
  }
  return name + '.template'
}

function compileTemplateAsModule (name, template) {
  name = getTemplateModuleName(name)
  var fns = vueCompiler.compile(template)
  return `SystemJS.set(${JSON.stringify(name)},SystemJS.newModule({\n` +
    `render:${toFn(fns.render)},\n` +
    `staticRenderFns:[${fns.staticRenderFns.map(toFn).join(',')}]\n` +
  `}));`
}

function toFn (code) {
  return `function(){${code}}`
}
