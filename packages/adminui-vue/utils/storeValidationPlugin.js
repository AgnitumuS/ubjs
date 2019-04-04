const Vue = require('vue')
const { validationMixin } = require('vuelidate/lib/index')
const required = require('vuelidate/lib/validators/required').default

module.exports.storeValidationPlugin = (store) => {
  const validator = new Vue({
    mixins: [
      validationMixin
    ],
    computed: {
      name () {
        return store.getters['user/name']
      }
    },
    validations: {
      name: { required }
    }
  })
  console.log(validationMixin)
}
