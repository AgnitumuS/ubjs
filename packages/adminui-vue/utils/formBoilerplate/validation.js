const Vue = require('vue')
const { validationMixin } = require('vuelidate/lib/index')
const required = require('vuelidate/lib/validators/required').default

/**
 * Track Instance module data and validate it
 * Check entity schema attributes and set required to
 * props which have !allowNull param and defaultView is true
 * @param  {VuexStore} store vuex store
 * @return {VueInstance} Instance which contains $v, validation object
 */
function validateEntitySchema (store) {
  const entitySchema = store.getters.entitySchema
  const requiredFields = entitySchema
    .filterAttribute(attr => attr.defaultView && !attr.allowNull)
    .map(a => a.name)

  const validator = new Vue({
    store,
    mixins: [
      validationMixin
    ],

    computed: {
      values () {
        return this.$store.state.data
      },

      fieldList () {
        return this.$store.getters.fieldList
      }
    },

    validations () {
      return {
        values: this.fieldList.reduce((obj, field) => {
          const isRequired = requiredFields.includes(field)
          obj[field] = isRequired ? { required } : {}

          return obj
        }, {})
      }
    }
  })

  return validator.$v.values
}

/**
 * Mixin which inject $v object to current component
 */
const validationInjectMixin = {
  inject: ['_validation'],
  computed: {
    $v () {
      return this._validation()
    }
  }
}

module.exports = {
  validateEntitySchema,
  validationInjectMixin
}
