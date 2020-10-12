const Vue = require('vue')
const Dialog = require('./Dialog.vue').default

/**
 * Create dialog from template.
 *
 * @param {Vue.Component} Template Dialog content.
 * @param {object} templateProps Props of template
 * @param {object} dialogProps Element-ui dialog props.
 *
 * @returns {Promise<unknown>}
 *   Resolves by "done" function which available in "props" of template or by closing dialog.
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
