const Vue = require('vue')
exports.formCode = {
  initUBComponent: function () {
    let me = this
    let htmlEl = this.query('[forVue]')[0].getEl().dom.firstChild
    me.vm = new Vue({
      template: `<el-date-picker type="date" v-model="docDate"></el-date-picker>`,
      el: htmlEl,
      data: function () {
        return {
          docDate: new Date()
        }
      }
    })
    me.on('destroy', () => {
      me.vm.$destroy()
    })
  }
}
