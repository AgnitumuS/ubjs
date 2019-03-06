const Vue = require('vue')
const UbDialogTemplate = require('./template.vue').default

module.exports = ({title, msg, buttonText, type = 'info', isDevInfo = false}) => {
  const UbDialog = Vue.extend(UbDialogTemplate)
  let resolveConfirm
  const promise = new Promise(resolve => {
    resolveConfirm = resolve
  })

  const el = document.createElement('div')
  document.body.appendChild(el)

  new UbDialog({
    el,
    data () {
      return {
        title,
        msg,
        buttonText,
        type,
        isDevInfo
      }
    },
    methods: {
      resolveConfirm
    }
  })

  return promise
}
