<script>
/**
 * Create a form component and validators based on entity attribute type
 */
export default {
  name: 'UAutoField',

  inject: ['$v', 'entity', 'entitySchema'],

  props: {
    /**
     * Attribute name
     */
    attributeName: {
      type: String,
      required: true
    },

    /**
     * Overrides required prop of <form-row />
     */
    required: Boolean
  },

  computed: {
    model: {
      get () {
        return this.$store.state.data[this.attributeName]
      },

      set (value) {
        if (this.$v && this.attributeName in this.$v) {
          this.$v[this.attributeName].$touch()
        }
        this.$store.commit(`SET_DATA`, {key: this.attributeName, value})
      }
    },

    dataType () {
      return this.entitySchema.attributes[this.attributeName].dataType
    },

    associatedEntity () {
      return this.entitySchema.attributes[this.attributeName].associatedEntity
    },

    label () {
      return this.entitySchema.attributes[this.attributeName].caption
    },

    isRequired () {
      return this.$v &&
        this.$v[this.attributeName] &&
        this.$v[this.attributeName].$params.hasOwnProperty('required')
    },

    isError () {
      return this.$v &&
        this.$v[this.attributeName] &&
        this.$v[this.attributeName].$error
    },

    firstDayOfWeek () {
      // moment days monday equals to 0, instead element-ui which monday equals to 1
      const momentDay = this.$moment.localeData().firstDayOfWeek()
      if (momentDay === 0) {
        return 7
      } else {
        return momentDay
      }
    }
  },
  render: function (h) {
    let cmp
    let baseAttrs = { // vue split attrs into attrs and props automatically
      ...this.$attrs,
      attributeName: this.attributeName,
      value: this.model
    }
    switch (this.dataType) {
      case 'Boolean':
        cmp = h('el-checkbox', {
          attrs: baseAttrs,
          on: {
            change: (value) => {
              this.model = value
            }
          }
        })
        break
      case 'Date':
      case 'DateTime':
        cmp = h('el-date-picker', {
          attrs: {
            type: this.dataType.toLowerCase(),
            placeholder: this.$ut(this.dataType === 'Date' ? 'selectDate' : 'selectDateAndTime'),
            pickerOptions: { firstDayOfWeek: this.firstDayOfWeek },
            ...baseAttrs,
          }, on: {
            input: (value) => {
              this.model = value
            }
          }
        })
        break
      case 'Enum':
        cmp = h('u-select-enum', {
          attrs: {
            eGroup: this.entitySchema.attributes[this.attributeName].enumGroup,
            clearable: this.entitySchema.attributes[this.attributeName].allowNull,
            ...baseAttrs
          },
          on: {
            input: (value) => { this.model = value }
          }
        })
        break
      case 'Entity':
        cmp = h('u-select-entity', {
          attrs: {
            entityName: this.associatedEntity,
            ...baseAttrs
          },
          on: {
            input: (value) => { this.model = value }
          }
        })
        break
      case 'Many':
        cmp = h('u-select-many', {
          attrs: {
            entityName: this.associatedEntity,
            ...baseAttrs
          },
          on: {
            input: (value) => { this.model = value }
          }
        })
        break
      case 'Text':
        cmp = h('el-input', {
          attrs: {
            type: 'textarea',
            autosize: { minRows: 3, maxRows: 4 },
            placeholder: this.$ut(this.dataType === 'Date' ? 'selectDate' : 'selectDateAndTime'),
            pickerOptions: this.firstDayOfWeek,
            ...baseAttrs,
          }
        })
        break
      case 'Document':
        cmp = h('u-file', {
          attrs: baseAttrs,
          on: {
            input: (value) => { this.model = value }
          }
        })
        break
      case 'Json':
        cmp = h('u-code-mirror', {
          attrs: baseAttrs,
          on: {
            input: (value) => { this.model = value }
          }
        })
        break
      default:
        cmp = h('u-input', {
          attrs: baseAttrs
        })
    }
    return h('u-form-row',
      {
        attrs: {
          label: this.label,
          required: this.isRequired,
          error: this.isError,
          ...this.$attrs
        }
      },
      [cmp, this.$slots.default]
    )
  }
}
</script>

<docs>
  Create a form component and validators based on entity attribute type

  ### Basic usage

  ```vue
  <template>
    <u-auto-field attribute-name="code" />
  </template>
  <script>
    const { Form } = require('@unitybase/adminui-vue')

    module.exports.mount = function ({ title, entity, instanceID, rootComponent }) {
      Form({
        component: rootComponent,
        entity,
        instanceID,
        title
      }).mount()
    }
    module.exports.default = {
      name: 'MyCustomVueComponent',
      inject: ['$v'], // валидация,

      computed: {
        ...mapInstanceFields(['code', 'caption']), // хелпер для получение/изменения данных формы

        ...mapGetters(['loading'])
      }
    }
  </script>
  ```

  ### Default slot
  Anything you need to render inside u-form-row container can be added as a u-auto-field default slot content.
  In sample below we output a description for SQL attribute:

  ``` vue
  <u-auto-field attribute-name="SQL">
    <div class="u-form-row__description">
      {{ this.entitySchema.attr('SQL').description }}
    </div>
  </u-auto-field>
  ```
</docs>
