## Validations

There are two ways to define validation for some form:
1. General global validation for form. This validation can be defined in the `Form.validation(...)`
   block. By default, this method configures validation of notNull entity attributes. But there
   is a possibility to override these rules or extend for some custom attributes passing a
   validation config as a parameter. This config should be a standard Vue object definition-like.
   The `validations` section is required in this config since it is responsible for defining
   attribute validations.
2. Local form validation. This validation can be defined locally in the `validations` section.
   To pass these rules for nested controls (UFormRow foe example for automatically getting
   error text) there is `validationMixin`. This mixin is responsible for creating of `validator`
   property. This is an object with several useful methods for interaction with a validation:
      - `getValidationState` - returns the current state of validation;
      - `getAttributeCaption` - returns caption by attribute name;
      - `getErrorForAttribute`- returns error text for some first failed validation rule of the attribute;
      - `getIsAttributeRequired` - returns boolean - if the attribute has the required rule in the configured validation;
      - `validateForm` - validates form data with the Vuelidate help.
Also, `validationMixin` provides this validator for nested controls.

In both cases, to interact with validation configured in some parent component or in
`Form.validation()` just injection of `validator` is needed.
Example:
parent-component.vue
```vue
<template>
  <child-component />
</template>
<script>
const { validationMixin } = require('@unitybase/adminui-vue')
const { between } = require('vuelidate/lib/validators')

export default {
  mixins: [
    validationMixin
  ],
  ...,
  validations() {
    return {
      customAttr: {
        between: between(1, 67)
      },
      ...
    }
  }
}
</script>
```

child-component.vue
```vue
<template>
  <div>
    Error text for customAttr: {{ customAttrError }}
  </div>
</template>
<script>
export default {
  inject: [
    'validator'
  ],

  ...

  computed: {
    ...,
    customAttrError() {
      return this.validator.getErrorForAttribute('customAttr')
    }
  },

  methods: {
    apply() {
      // validate from data before some action
      this.validator.validateForm({showErrorModal: false})
      this.run(...)
    }
  }
}
</script>
```

## Custom rules with configured error text

The `UFormRow` control supports automatically getting an error for the attribute
based on configured error messages for the attribute's rules. To create rules like
this there is the `formHelpers.validateWithErrorText` method. This method assigns
`$errorText` validator parameter for some validation rule and `UFormRow` control
looks for these parameters of some first failed attribute's rule
Example:
```vue
<template>
  <div>
    <u-form-row
      label="document_form.regNumber"
      attribute-name="regNumber"
    >
      <u-base-input v-model="regNumber" />
    </u-form-row>

    <u-form-row
      label="document_form.systemConfig"
      attribute-name="systemConfig"
    >
      ...
    </u-form-row>
  </div>
</template>

<script>
const { validationMixin, formHelpers } = require('@unitybase/adminui-vue')

export default {
  mixins: [
    validationMixin
  ],

  data () {
    return {
      regNumber: null,
      systemConfig: null
    }
  }

  validations() {
    return {
      regNumber: {
        unique: formHelpers.validateWithErrorText(
          'validation_errors.uniqueRegNumber',

          value => !this.documents.some(doc => doc.regNumber === value)
        )
      },

      systemConfig: {
        json: formHelpers.validateWithErrorText(
          'validation_errors.json',

          value => {
            try {
              JSON.parse(value)
              return true
            } catch (e) {
              return false
            }
          }
        )
      }
    }
  }
}
</script>
```

## Caption for custom attributes

There is a way to define captions for attributes used in form validation. The `attributeCaptions`
section can be used for it. This can be an object or function (reactive and dynamic)
property. In this section, there is a possibility to define captions for non-entity
attributes or override for entity ones. These captions can be used in `UFormRow` for
automatically getting of control label by an `attribute-name` of for displaying in
error modal when validation is failed.
Example:
```js
module.exports.mount = cfg => {
  Form(cfg)
    .processing()
    .validation({
      ....,

      attributeCaptions() {
        return {
          customAttribute1: 'some.i18n.key.for.customAttribute1',

          complexField: {
            nestedAttribute1: 'some.i18n.key.for.nestedAttribute1',
          }
        }
      }
    })
    .mount()
```

## Example of defining some complex validation

```js
const { formHelpers } = require('@unitybase/adminui-vue')
const { required, between } = require('vuelidate/lib/validators/index')

const json = formHelpers.validateWithErrorText(
  'validation_errors.json',

  value => {
    try {
      JSON.parse(value)
      return true
    } catch (e) {
      return false
    }
  }
)

module.exports.mount = cfg => {
  Form(cfg)
    .processing()
    .validation({
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
         dynamicField: 'some.i18n.key.for.dynamicField',

         processVariables: {
           emailConfig: 'some.i18n.key.for.processVariables.emailConfig',
           objectID: 'some.i18n.key.for.processVariables.objectID'
         }
       }
      }
    })
    .mount()
}
```

## Example of use of configured rules error texts and attribute captions

```vue
<template>
  <!-- error automatically be taken from `$v.name.$params[<firstInvalidParam>].$errorText` -->
  <!-- label automatically be taken from customAttributes or calculated as i18n(`${this.entity}.${this.attributeName}`) -->
  <!-- required automatically calclulated if `required` rule is defined for `$v.name` -->
  <u-form-row
    attribute-name="name"
  />

  <!-- overrided default label -->
  <u-form-row
    attribute-name="name"
    label="custom"
  />

  <!-- overrided displayed error -->
  <u-form-row
    attribute-name="name"
    :error="someComputedError"
    required
  />

  <!-- overrided required prop -->
  <u-form-row
    attribute-name="name"
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
