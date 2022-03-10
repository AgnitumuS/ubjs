<template>
  <filter-template
    :button-disabled="isEmpty"
    @submit="submitHandler"
  >
    <u-select-entity
      v-model="value"
      remove-default-actions
      :repository="column.repository"
      :entity-name="column.attribute.associatedEntity"
      @input="onChange"
    />
  </filter-template>
</template>

<script>
export default {
  name: 'FilterEntityEqual',

  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },

  mixins: [require('../mixinForFilter.js')],

  props: {
    column: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      value: null,
      condition: 'equal',
      formattedValue: ''
    }
  },

  computed: {
    isEmpty () {
      return this.value === '' || this.value === null
    }
  },

  created () {
    this.value = this.value === undefined || this.value === '' ? null : this.value
  },

  methods: {
    onChange (ID, row) {
      let value = row.ID
      const entity = this.column.attribute.associatedEntity
      const entitySchema = entity ? this.$UB.connection.domain.get(entity) : {}
      const descriptionAttr = entitySchema.descriptionAttribute
      if (descriptionAttr && descriptionAttr in row) {
        value = row[descriptionAttr]
      } else if ('caption' in row) {
        value = row.caption
      } else if ('name' in row) {
        this.formattedValue = row.name
      }

      this.formattedValue = value
    },
    getCondition() {
      const { $ut, condition, value, formattedValue } = this
        return {
          whereList: [{ condition, value }],
          description: $ut(condition) + ' ' + formattedValue
        }
    }
  }
}
</script>
