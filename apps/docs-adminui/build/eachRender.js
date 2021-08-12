import { Form } from '@unitybase/adminui-vue'
import Vuex from 'vuex'

export default (previewComponent) => {
  return {
    render (createElement) {
      if (this.loading) {
        return createElement('div', 'loading...')
      } else {
        return createElement({
          render: h => h(previewComponent),
          inject: ['FormInstance'],
          provide () {
            return {
              formCode: this.FormInstance.formCode,
              entity: this.FormInstance.entity,
              entitySchema: this.FormInstance.entitySchema,
              fieldList: this.FormInstance.fieldList
            }
          }
        })
      }
    },

    data () {
      return {
        loading: true,
        FormInstance: {}
      }
    },

    provide () {
      return {
        FormInstance: this.FormInstance
      }
    },

    async created () {
      if (this._authPromise === null) { // OFFLINE
        this.loading = false
        return
      }
      await this._authPromise
      Object.assign(
        this.FormInstance,
        Form({
          entity: 'req_request',
          instanceID: this._firstReqID
        }).processing()
      )
      const { storeConfig } = this.FormInstance
      this.$store = new Vuex.Store(storeConfig)
      await this.$store.dispatch('init')
      this.loading = false
    }
  }
}
