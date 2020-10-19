<script>
/**
 * Create a form component and validators based on entity attribute type
 */
export default {
  name: 'UAutoField',

  inject: {
    $v: {},
    entity: {},
    entitySchema: {},
    inheritedSlots: {
      default: () => ({})
    }
  },

  props: {
    /**
     * Attribute name
     */
    attributeName: {
      type: String,
      required: true
    },

    /**
     * Can be used to override "required" prop of <form-row />
     */
    required: {
      type: Boolean,
      default: undefined
    },

    /**
     * If defined then specified component will be used instead of default what based on attribute type.
     * For example `<u-auto-field attribute-name="bool_attr" force-cmp="el-switch" />` will create
     * `el-switch` instead of `el-checkbox` (default cmp for Boolean)
     */
    forceCmp: {
      type: String,
      default: undefined
    }
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
        this.$store.commit('SET_DATA', { key: this.attributeName, value })
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
      return this.required !== undefined ? this.required : (
        this.$v && this.$v[this.attributeName] && 'required' in this.$v[this.attributeName].$params
      )
    },

    isError () {
      return this.$v &&
        this.$v[this.attributeName] &&
        this.$v[this.attributeName].$error
    }
  },
  render: function (h) {
    let cmp
    const baseAttrs = { // vue split attrs into attrs and props automatically
      ...this.$attrs,
      attributeName: this.attributeName,
      value: this.model
    }

    switch (this.dataType) {
      case 'Boolean':
        cmp = h(this.forceCmp || 'el-checkbox', {
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
        cmp = h(this.forceCmp || 'u-date-picker', {
          attrs: {
            type: this.dataType.toLowerCase(),
            placeholder: this.$ut(this.dataType === 'Date' ? 'selectDate' : 'selectDateAndTime'),
            ...baseAttrs
          },
          on: {
            input: (value) => {
              this.model = value
            }
          }
        })
        break
      case 'Enum':
        cmp = h(this.forceCmp || 'u-select-enum', {
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
        cmp = h(this.forceCmp || 'u-select-entity', {
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
        cmp = h(this.forceCmp || 'u-select-many', {
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
        cmp = h(this.forceCmp || 'el-input', {
          attrs: {
            type: 'textarea',
            autosize: { minRows: 3, maxRows: 4 },
            ...baseAttrs
          },
          on: {
            input: (value) => { this.model = value }
          }
        })
        break
      case 'Document':
        cmp = h(this.forceCmp || 'u-file', {
          attrs: baseAttrs,
          on: {
            input: (value) => { this.model = value }
          }
        })
        break
      case 'Json':
        cmp = h(this.forceCmp || 'u-code-mirror', {
          attrs: baseAttrs,
          on: {
            input: (value) => { this.model = value }
          }
        })
        break
      case 'String':
        cmp = h(this.forceCmp || 'u-input', {
          attrs: {
            maxLength: this.entitySchema.attributes[this.attributeName].size,
            ...baseAttrs
          }
        })
        break
      default:
        cmp = h(this.forceCmp || 'u-input', {
          attrs: baseAttrs
        })
    }
    const UFormRow = h('u-form-row',
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

    const slot = this.inheritedSlots[`attr_${this.attributeName}`]
    if (slot) {
      return h(slot, {
        attrs: {
          ...baseAttrs,
          originalComponent: {
            render: () => UFormRow
          }
        }
      })
    }

    return UFormRow
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
