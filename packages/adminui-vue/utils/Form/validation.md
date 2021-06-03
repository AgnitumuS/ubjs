## Validations

Write general


## Custom rules with configured error text

Create own validation function to use them in `validations() {}` config.
It is recommended to create these validation functions with `withParams` help to define
error text for this rule.
Example:
```javascript
const { i18n } = require('@unitybase/ub-pub')
const { withParams } = require('vuelidate/lib/params')

const columnsCount = wihParams(
  { $errorText: i18n('validation_errors.tableColumns') },
  tableConfig => tableConfig.columns.length > 0
)

module.exports.mount = cfg => {
  Form(cfg)
    .processing()
    .validation({
      validation() {
        return {
          tableConfig: {
            columnsCount
          }
        }
      }
    })
    .mount()
```

## Caption for custom attributes for displaying in error modal

Define captions for attributes that not belongs to entity. To do that use
`attributeCaptions` option. Is can be an object or function if you want to set dynamic
value.
Example:
```javascript
const { i18n } = require('@unitybase/ub-pub')

module.exports.mount = cfg => {
  Form(cfg)
    .processing()
    .validation({
      validation() {
        return {...}
      },

      attributeCaptions() {
        return {
          customAttribute1: i18n('some.i18n.key.for.customAttribute1'),
          customAttribute1: i18n('some.i18n.key.for.customAttribute2'),
        }
      }
    })
    .mount()
```

## Using of nested validation

Define rules for nested attributes.
Example:
```javascript
const { i18n } = require('@unitybase/ub-pub')

module.exports.mount = cfg => {
  Form(cfg)
    .processing()
    .validation({
      validation() {
        return {
          humanCharacteristics: {
            age: between(1, 120),
            gender: withParams(
              { $errorText: i18n('human_errors.invalidGender') },
              value => !['MALE', 'FEMALE'].includes(value)
            )
          }
        }
      },

      attributeCaptions() {
        return {
          humanCharacteristics: {
            age: i18n('some.i18n.key.for.humanCharacteristics.age'),
            gender: i18n('some.i18n.key.for.humanCharacteristics.gender'),
          }
        }
      }
    })
    .mount()
```

## Using of mixins inside validation config

...

## Using

```javascript
const { i18n } = require('@unitybase/ub-pub')
const { required, between } = require('vuelidate/lib/validators/index')
const { withParams } = require('vuelidate/lib/params')

const json = wihParams(
  { $errorText: i18n('validation_errors.json') },
  text => {
    if (typeof text === 'string') {
      try {
        JSON.parse(text)
      } catch (e) {
        return false
      }
    }
    return true
  }
)

module.exports.mount = cfg => {
  Form(cfg)
  .processing()
  .validation({
    mixins: [
      getValidatedCodeMixin({ disableCyrillic: true })
    ],

    computed: {
      ...mapInstanceFields([
        'code',
        'name',
        'someNumber'
      ]),

      dynamicField () {
        return this.$store.state.dynamicField
      }

      processVariables () {
        return this.$store.state.processVariables
      }
    },

    validations () {
      return {
        code: {
          code
        },

        name: {
          required
        },

        someNumber: {
          required,
          between: between(20, 30)
        },

        // define rules for nested validation
        processVariables: {
          emailConfig: {
            json
          },

          objectID: {
            required
          }
        },

        // dynamic part of validation
        ...(this.someNumber > 25
          ? { dynamicField: { required } }
          : {}
        )
      }
    },

    // define captions for non-entity attributes for displaying in error modal
    attributeCaptions() {
      return {
        dynamicField: i18n('some.i18n.key.for.dynamicField'),

        processVariables: {
          emailConfig: i18n('some.i18n.key.for.processVariables.emailConfig'),
          objectID: i18n('some.i18n.key.for.processVariables.objectID')
        }
      }
    }
  })
  .mount()
}

const CODE_REGEXP = /^[a-zA-Z_]+([a-zA-Z0-9_]+)*$/
const CODE_NO_UNDERSCORE_REGEXP = /^[a-zA-ZА-Яа-я][a-zA-ZА-Яа-я0-9]*$/

function getValidatedCodeMixin (
  {
    disableUnderscore = false
  } = {}
) {
  let codeRegexp = CODE_REGEXP
  let errorLocale = 'model_validation.codeRegexp'

  if (disableUnderscore) {
    codeRegexp = CODE_NO_UNDERSCORE_REGEXP
    errorLocale = 'model_validation.codeRegexpNoUnderscore'
  }

  return {
    validations() {
      return {
        code: {
          regexp: withParams(
            { $errorText: i18n(errorLocale) },
            v => !v || typeof v === 'string' && v.match(codeRegexp) !== null
          )
        }
      }
    }
  }
})
```

## Using in templates

To get error text for some field you can (inject $errorText function or just get from this) ??
and pass the path to the field. The path can be just a string when we want to get an error for
an attribute of some entity or array if we want to get an error text from some nested attribute.
If there is not defined `validator.getErrorForAttribute(...)` for any of attribute rules, default i18n('requiredField') be displayed.

Examples:
```vue
<template>
  <!-- error be taken from $v.name.$params[<firstInvalidParam>].$errorText -->
  <!-- label automatically be calculated as i18n(`${this.entity}.${this.attributeName}`) ot get from customAttributes -->
  <!-- required based on -->
  <!-- readonly based on attribute definition -->
  <u-form-row
    attribute-name="name"
  />

  <!-- overrided default label -->
  <u-form-row
    attribute-name="name"
    label="custom"
    required
  />

  <!-- overrided displayed error -->
  <u-form-row
    attribute-name="name"
    :error="..."
    required
  />

  <!-- to get error message for form can be used validator.getErrorForAttribute(...) method -->
  <u-form-row
    :label="$ut('bpm_Process_form.emailConfig')"
    :error="validator.getErrorForAttribute('email.config.email')"
    required
  />
</template>
```
