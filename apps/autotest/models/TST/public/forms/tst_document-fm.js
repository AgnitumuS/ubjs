const Vue = require('vue')
exports.formCode = {
  initUBComponent: function () {
    let me = this
    let htmlEl = this.query('[forVue]')[0].getEl().dom.firstChild
    me.vm = new Vue({
      el: htmlEl,
      template: `<div>
        <el-date-picker type="date" v-model="docDate"></el-date-picker>
        <el-date-picker type="datetime" v-model="docDateTime"></el-date-picker>
      </div>`,
      data: function () {
        return {
          docDate: me.record.get('docDate'),
          docDateTime: me.record.get('docDateTime')
        }
      },
      watch: {
        docDate: function (newValue) {
          me.record.set('docDate', newValue)
        },
        docDateTime: function (newValue) {
          me.record.set('docDateTime', newValue)
        }
      }
    })
    me.on('destroy', () => {
      me.vm.$destroy()
    })
  }
}
