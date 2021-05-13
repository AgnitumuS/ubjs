/* global UB */

const Vue = require('vue')
// vuex required for type checking
// eslint-disable-next-line no-unused-vars
const Vuex = require('vuex')
const { validationMixin } = require('vuelidate')
const { required } = require('vuelidate/lib/validators/index')

const { mapInstanceFields } = require('./helpers')

module.exports = class Validator {
  /**
   * Create a Vue instance for form data validation.
   * Default behavior is to check entity schema attributes with `allowNull=true` and `defaultView=true`.
   *
   * `customValidationMixin` can extend default behavior by it own rules.
   *
   * @param {Vuex} store Store
   * @param {UBEntity} entitySchema Entity schema
   * @param {string[]} masterFieldList Field list of master entity
   * @param {Vue} [customValidationMixin={}] Custom validations what extends default
   * @return {Vue} Vue instance
   */
  constructor (store, entitySchema, masterFieldList, customValidationMixin = {}) {
    this._entitySchema = entitySchema

    const requiredFields = entitySchema
      .filterAttribute(attr => attr.defaultView && !attr.allowNull && masterFieldList.includes(attr.code))
      .map(a => a.name)

    const defaultValidationMixin = {
      computed: mapInstanceFields(entitySchema.getAttributeNames()),

      validations () {
        return Object.fromEntries(requiredFields.map(field => [field, { required }]))
      }
    }

    this._vueInstance = new Vue({
      store,
      mixins: [
        validationMixin,
        defaultValidationMixin,
        customValidationMixin
      ]
    })
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
