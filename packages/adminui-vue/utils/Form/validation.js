/* global UB */

const Vue = require('vue')
const { validationMixin } = require('vuelidate')
const { required } = require('vuelidate/lib/validators/index')

const { mapInstanceFields } = require('./helpers')

module.exports = class Validator {
  constructor (store, entitySchema, masterFieldList, customValidationMixin) {
    this._entitySchema = entitySchema
    this._vueInstance = createValidatorInstance(
      store,
      entitySchema,
      masterFieldList,
      customValidationMixin
    )
  }

  /**
   * Returns the current state of validation. The method is useful when you have dynamic validation
   * @returns {object} Vuelidate object
   */
  getValidationState () {
    return this._vueInstance.$v
  }

  /**
   * Validates form data with Vuelidate. If validation is failed `UBAbortError` will be thrown
   * @throws {UB.UBAbortError}
   */
  validateForm () {
    const { $v } = this._vueInstance
    $v.$touch()
    if ($v.$error) {
      const masterEntityName = this._entitySchema.code
      const invalidFields = Object.keys($v.$params).filter(f => $v[f].$invalid)
      const errors = invalidFields.map(field => {
        const formFieldCaption = this._vueInstance[`${field}:caption`]
        if (formFieldCaption) {
          return formFieldCaption
        }
        const localeString = `${masterEntityName}.${field}`
        return UB.i18n(localeString) === localeString ? field : UB.i18n(localeString)
      })
      const errMsg = UB.i18n('validationError', errors.join(', '))
      const err = new UB.UBError(errMsg)
      UB.showErrorWindow(err)
      throw new UB.UBAbortError(errMsg)
    }
  }

  /**
   * Reset validation state
   */
  reset () {
    this._vueInstance.$v.$reset()
  }
}

/**
 * Create a Vue instance for validation of form data.
 * Instance configured to check entity schema attributes with `allowNull=true` and `defaultView=true`
 * @param {Vuex} store Store
 * @param {UBEntity} entitySchema Entity schema
 * @param {Vue} customValidationMixin Custom validation mixin in case when need to extend default validation
 * @param {string[]} masterFieldList Field list of master entity
 * @return {Vue} Vue instance
 */
function createValidatorInstance (store, entitySchema, masterFieldList, customValidationMixin = {}) {
  const requiredFields = entitySchema
    .filterAttribute(attr => attr.defaultView && !attr.allowNull && masterFieldList.includes(attr.code))
    .map(a => a.name)

  const defaultValidationMixin = {
    computed: mapInstanceFields(entitySchema.getAttributeNames()),

    validations () {
      return Object.fromEntries(requiredFields.map(field => [field, { required }]))
    }
  }

  return new Vue({
    store,
    mixins: [
      validationMixin,
      defaultValidationMixin,
      customValidationMixin
    ]
  })
}
