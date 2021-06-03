/* global UB */

const Vue = require('vue')
// vuex required for type checking
// eslint-disable-next-line no-unused-vars
const Vuex = require('vuex')
const { validationMixin } = require('vuelidate')
const { required } = require('vuelidate/lib/validators/index')
const { i18n } = require('@unitybase/ub-pub')

const { mapInstanceFields } = require('./helpers')

const getByKey = (obj, key) => obj ? obj[key] : null

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
    const requiredFields = entitySchema
      .filterAttribute(attr => attr.defaultView && !attr.allowNull && masterFieldList.includes(attr.code))
      .map(a => a.name)

    const getEntityAttributeCaption = field => {
      const localeString = `${entitySchema.code}.${field}`
      return UB.i18n(localeString) === localeString ? field : UB.i18n(localeString)
    }

    const defaultValidationMixin = {
      computed: {
        ...mapInstanceFields(entitySchema.getAttributeNames()),

        attributeCaptions () {
          const { attributeCaptions } = this.$options
          if (typeof attributeCaptions === 'function') {
            return attributeCaptions.call(this)
          }
          return attributeCaptions
        }
      },

      validations () {
        return Object.fromEntries(requiredFields.map(field => [field, { required }]))
      },

      attributeCaptions: {},

      methods: {
        getCustomFormCaptionByPath (path) {
          return path.reduce(getByKey, this.attributeCaptions)
        },

        getAttributeCaption (path) {
          return this.getCustomFormCaptionByPath(path) ?? getEntityAttributeCaption(path[0])
        }
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
   * @param {string} attributeName
   * @returns {string}
   */
  getAttributeCaption (attributeName) {
    const attributePath = attributeName.split('.')
    const caption = this._vueInstance.getAttributeCaption(attributePath)
    return i18n(caption)
  }

  /**
   * @param {string} attributeName
   * @returns {string | null}
   */
  getErrorForAttribute (attributeName) {
    const attributePath = attributeName.split('.')
    const attrValidationState = attributePath.reduce(getByKey, this._vueInstance.$v)
    if (attrValidationState && attrValidationState.$error) {
      for (const param in attrValidationState.$params) {
        if (attrValidationState[param] === false) {
          const { $errorText } = attrValidationState.$params[param] ?? {}
          if ($errorText) {
            return i18n($errorText)
          }
        }
      }
      return i18n('requiredField')
    }
    return null
  }

  /**
   * @param {string} attributeName
   * @returns {boolean}
   */
  getIsAttributeRequired (attributeName) {
    const attributePath = attributeName.split('.')
    const attrValidationState = attributePath.reduce(getByKey, this._vueInstance.$v)
    return attrValidationState && 'required' in attrValidationState
  }

  /**
   * Validates form data with Vuelidate. If validation is failed `UBAbortError` will be thrown
   * @throws {UB.UBAbortError}
   */
  validateForm () {
    const { $v } = this._vueInstance
    $v.$touch()
    if ($v.$error) {
      const invalidFieldsCaptions = new Set()
      for (const { path } of $v.$flattenParams()) {
        const attrValidation = path.reduce(getByKey, $v)
        if (attrValidation.$error) {
          const caption = this._vueInstance.getAttributeCaption(path)
          invalidFieldsCaptions.add(i18n(caption))
        }
      }
      const errMsg = UB.i18n('validationError', [...invalidFieldsCaptions].join(', '))
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
