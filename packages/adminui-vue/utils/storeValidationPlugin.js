const Vue = require('vue')
const { validationMixin } = require('vuelidate/lib/index')
const required = require('vuelidate/lib/validators/required').default
const { mapInstanceFields } = require('./storeInstanceModule')

module.exports.storeValidationPlugin = (store) => {
  store.subscribe(mutation => {
    if (mutation.type === 'LOAD_DATA') {
      const fields = Object.keys(mutation.payload)
      const validator = new Vue({
        store,
        mixins: [
          validationMixin
        ],
        computed: {
          ...mapInstanceFields(fields)
        },
        validations () {
          return fields.reduce((obj, field) => {
            obj[field] = { required }
            return obj
          }, {})
        }
      })
      console.log(validator.$v)
    }
  })
}
