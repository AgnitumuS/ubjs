/**
 * Magic links module - adds onclick event to a document body and intercept clicks on hyperlink
 *
 * Hyperlink should be in form `<a href='#' data-cmd-type="commandToRun" ....>`
 * In case command specified in `cmdType` data attribute is registered using `addCommand` it will be executed.
 * Links samples:
 * @example

 <a href="#" data-cmd-type="showForm" data-entity="ubm_navshortcut", data-instance-id=332352169869385>
   Edit existed shortcut with specified ID
 </a>

 <a href="#" data-cmd-type="setFocus" data-elm-id="ubedit-11223">
   Set focus on edit
 </a>

 <a href="#"
    data-cmd-type="showReport"
    data-cmd-data='{"reportCode":"your-report-code","reportType":"html","reportParams":{"a":"b"},"reportOptions":{"allowExportToExcel":"xls"}}'
 >
   Show report `your-report-code` with parameters
 </a>

 *
 */

const Vue = require('vue')

module.exports = {
  addCommand,
  install
}

const commands = {}

/**
 * Adds a global onclick event listener
 */
function install () {
  if (document) document.addEventListener('click', checkClickOnMagicLink, false)
}

/**
 * Register action for command. Command is passed as <a href="#' data-cmd-type="commandName">.
 * If handler for command already exists it will be overrated
 * @param {string} command
 * @param {function<Object, EventTarget?>} handler
 */
function addCommand (command, handler) {
  commands[command] = handler
}
/**
 *
 * @param {Event} e
 */

function checkClickOnMagicLink (e) {
  let target = e.target
  if (target.nodeName !== 'A') return
  if (!target.href.endsWith('#')) return
  let intercepted = false
  let params = dataAttributesToObject(target.dataset)
  // Create fake (hidden) message and get it zIndex
  params.zIndex = Vue.prototype.$message({
    customClass: 'ub-fake-notification'
  }).dom.style.zIndex

  if (!params.cmdType && params.entity && params.id) { // legacy data-entity + data-id
    console.warn('Deprecated magic link format data-entity + data-id. Use <a href="#" data-cmd-type="showForm" data-entity="entityCode" data-instance-id=1233>')
    params.cmdType = 'showForm'
    params.instanceId = params.id
    delete params.id
  }
  if (params.cmdType) {
    if (commands[params.cmdType]) {
      intercepted = true
      commands[params.cmdType](params, target)
    } else {
      console.debug('Handler for magicLink command ', params.cmdType, ' is not registered')
    }
  }
  if (intercepted) {
    e.preventDefault()
  }
}

/**
 * Transform a dataset to the plain object.
 * Nested props can be passed as stringified array or object
 * @example
 *    // <a href='#' id="test" data-cmd-type="showList" data-id=100334 data-field-list='["ID", "code", "name']'>
 *    dataset = document.getElementById('test').dataset
 *    dataAttributesToObject(dataset) // {cmdType: 'showList', id: 100334, fieldList: ['ID', 'code', 'name']}
 *
 * @param dataset
 */
function dataAttributesToObject (dataset) {
  let keys = Object.keys(dataset)
  let result = {}
  for (let i = 0, L = keys.length; i < L; i++) {
    let k = keys[i]
    let v = dataset[k]
    if ((v.startsWith('{') && v.endsWith('}')) ||
      (v.startsWith('[') && v.endsWith('}'))) {
      result[k] = JSON.parse(v)
    } else {
      if (/^\d+$/.test(v)) {
        result[k] = parseInt(v, 10)
      } else {
        result[k] = v
      }
    }
  }
  return result
}
