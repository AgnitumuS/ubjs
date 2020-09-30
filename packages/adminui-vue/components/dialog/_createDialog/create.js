const Vue = require('vue')
const BaseTemplate = require('./BaseTemplate.vue').default

module.exports = function (Template, props, dialogProps) {
  return new Promise(resolve => {
    new Vue({
      render: h => h(
        BaseTemplate,
        {
          attrs: props,
          props: { resolve, ...dialogProps },
          scopedSlots: {
            default: props => h(Template, { props }),
          }
        }
      )
    }).$mount()
  })
}
