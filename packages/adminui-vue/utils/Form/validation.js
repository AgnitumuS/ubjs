/* global UB */

const _ = require('lodash')
const Vue = require('vue')
const { validationMixin } = require('vuelidate')
const { required } = require('vuelidate/lib/validators/index')

const { mapInstanceFields } = require('./helpers')

/**
 * Helper function that merges validation config defined in mixins
 * @param {object|function|undefined} a
 * @param {object|function|undefined} b
 * @returns {object}
 */
function mergeValidations (a, b) {
  if (typeof a === 'function' || typeof b === 'function') {
    return function () {
      const aObj = typeof a === 'function' ? a.call(this) : a
      const bObj = typeof b === 'function' ? b.call(this) : b
      return _.merge(aObj, bObj)
    }
  }
  return _.merge(a, b)
}

Vue.config.optionMergeStrategies.validations = mergeValidations

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

  getValidationState () {
    return this._vueInstance.$v
  }

  validateForm () {
    const $v = this.getValidationState()
    $v.$touch()
    if ($v.$error) {
      const masterEntityName = this._entitySchema.code
      const fields = Object.keys($v.$params)
      const errors = fields
        .filter(f => $v[f].$invalid)
        .map(field => {
          const configuredFieldLocale = this._vueInstance[`${field}:inLocale`]
          return configuredFieldLocale || getEntityFieldInLocale(masterEntityName, field)
        })
      const errMsg = UB.i18n('validationError', errors.join(', '))
      const err = new UB.UBError(errMsg)
      UB.showErrorWindow(err)
      throw new UB.UBAbortError(errMsg)
    }
  }

  reset () {
    this._vueInstance.$v.$reset()
  }
}

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

/**
 * @param {string} entity
 * @param {string} field
 * @returns {string}
 */
function getEntityFieldInLocale (entity, field) {
  const localeString = `${entity}.${field}`
  if (UB.i18n(localeString) === localeString) {
    return field
  }
  return UB.i18n(localeString)
}
