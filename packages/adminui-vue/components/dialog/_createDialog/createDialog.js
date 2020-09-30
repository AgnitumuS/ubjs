const Vue = require('vue')
const Dialog = require('./Dialog.vue').default

/**
 * Create dialog with provided template.
 *
 * @param {Vue.Component} Template Dialog content.
 * @param {object} templateProps Props of template
 * @param {object} dialogProps Element-ui dialog props.
 *
 * @returns {Promise<unknown>}
 *   Resolves by "done" function which provided in "props" or by closing dialog.
 */
module.exports = function createDialog (Template, templateProps, dialogProps) {
  return new Promise(resolve => {
    new Vue({
      render: h => h(
        Dialog,
        {
          attrs: templateProps,
          props: { resolve, ...dialogProps },
          scopedSlots: {
            default: props => h(Template, { props })
          }
        }
      )
    }).$mount()
  })
}
