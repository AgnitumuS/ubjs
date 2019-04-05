const Vue = require('vue')
const { validationMixin } = require('vuelidate/lib/index')
const required = require('vuelidate/lib/validators/required').default
const { mapInstanceFields } = require('./storeInstanceModule')
let validator

/**
 * Plugin subscribed on store action 'loadDataWithValidation'
 * and when new data is set create new Vue instance
 * and trach validation by vuelidate
 */
module.exports.storeValidationPlugin = (store) => {
  // Subscribe store actions
  store.subscribeAction(action => {
    if (action.type === 'loadDataWithValidation') {
      const { data, requiredFields, isPartialLoad } = action.payload

      /**
       * if is partial load assign with current state.data
       * for create new instance with all fields
       */
      if (isPartialLoad) {
        Object.assign(data, store.state.data)
      }

      /**
       * if validator already created remove old instance
       */
      if (validator) {
        validator.$destroy()
      }
      const fields = Object.keys(data)

      /**
       * Vue instance subscribes to store
       * and track all fields by vuelidate
       */
      validator = new Vue({
        store,
        mixins: [
          validationMixin
        ],
        computed: {
          ...mapInstanceFields(fields)
        },
        validations () {
          return fields.reduce((obj, field) => {
            if (requiredFields.includes(field)) {
              obj[field] = { required }
            } else {
              obj[field] = {}
            }
            return obj
          }, {})
        }
      })

      // create link to validation object in store.state
      store.commit('SET_VALIDATION_OBJECT', validator.$v)
    }
  })
}
