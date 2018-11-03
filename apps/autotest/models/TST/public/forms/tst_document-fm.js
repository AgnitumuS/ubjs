const Vue = require('vue')
exports.formCode = {
  initComponentDone: function () {
    const me = this
    me.on('formDataReady', me.onFormDataReady)
  },
  initUBComponent: function () {
    let me = this
    me.vueDate = new Vue({
      template: `<el-date-picker type="date" v-model="docDate"></el-date-picker>`,
      data: function () {
        return {
          docDate: new Date()
        }
      },
      watch: {
        docDate: function (newValue) {
          me.record.set('docDate', newValue)
        }
      }
    })
  },
  onFormDataReady () {
    const me = this
    // insert Vue after component for attribute `docDate`
    let htmlEl = this.query('[attributeName=docDate]')[0].getEl().dom
    me.vueDate.$mount(htmlEl)
  }
}
