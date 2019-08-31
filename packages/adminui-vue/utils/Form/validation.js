module.exports = createValidator

const Vue = require('vue')
const { validationMixin } = require('vuelidate/lib/index')
const { required } = require('vuelidate/lib/validators/index')

/**
 * Track Instance module data and validate it
 * Check entity schema attributes and set required to
 * props which have !allowNull param and defaultView is true
 * @param {Vuex} store Store
 * @param {UBEntity} entitySchema Entity schema
 * @param {Array<string>} fieldList Master request field list
 * @return {object} Vuelidate validation object
 */
function createValidator (store, entitySchema, fieldList) {
  const requiredFields = entitySchema
    .filterAttribute(attr => attr.defaultView && !attr.allowNull)
    .map(a => a.name)

  const validatorInstance = new Vue({
    store,
    mixins: [ validationMixin ],

    computed: {
      values () {
        return this.$store.state.data
      }
    },

    validations () {
      return {
        values: fieldList.reduce((obj, field) => {
          const isRequired = requiredFields.includes(field)
          obj[field] = isRequired ? { required } : {}

          return obj
        }, {})
      }
    }
  })

  return validatorInstance.$v.values
}
