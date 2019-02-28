const Vue = require('vue')
let UbDialogTemplate = require('./template.vue')
if (BOUNDLED_BY_WEBPACK) {
  UbDialogTemplate = UbDialogTemplate.default
}

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
