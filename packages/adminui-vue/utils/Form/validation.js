module.exports = createValidator

const Vue = require('vue')
const { validationMixin } = require('vuelidate')
const { required } = require('vuelidate/lib/validators/index')
const { mapInstanceFields } = require('./helpers')

/**
 * Track Instance module data and validate it
 * Check entity schema attributes and set required to
 * props which have !allowNull param and defaultView is true
 * @param {Vuex} store Store
 * @param {UBEntity} entitySchema Entity schema
 * @param {Vue} customValidationMixin Custom validation mixin in case when need to override default validation
 * @param {string[]} masterFieldList Field list of master entity
 * @return {object} Vuelidate validation object
 */
function createValidator (store, entitySchema, masterFieldList, customValidationMixin = {}) {
  const requiredFields = entitySchema
    .filterAttribute(attr => attr.defaultView && !attr.allowNull && masterFieldList.includes(attr.code))
    .map(a => a.name)

  const defaultValidationMixin = {
    computed: mapInstanceFields(entitySchema.getAttributeNames()),

    validations () {
      return requiredFields.reduce((obj, field) => {
        obj[field] = { required }
        return obj
      }, {})
    }
  }

  const instance = new Vue({
    store,
    mixins: [
      validationMixin,
      defaultValidationMixin,
      customValidationMixin
    ]
  })

  return instance.$v
}
