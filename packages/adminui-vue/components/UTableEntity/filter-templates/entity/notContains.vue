<template>
  <filter-template
      :button-disabled="value.length === 0"
      @submit="submitHandler"
  >
    <u-select-multiple
      ref="selectMany"
      v-model="value"
      :repository="column.repository"
      :entity-name="column.attribute.associatedEntity"
    />
  </filter-template>
</template>

<script>
export default {
  name: 'FilterEntityNotContains',

  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },

  props: {
    column: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      value: []
    }
  },

  computed: {
    manyOptions () {
      const selectMany = this.$refs.selectMany
      if (selectMany) {
        return selectMany.displayedOptions
          .map(o => o.label)
          .join(', ')
      } else {
        return []
      }
    },
  },
  methods: {
    getCondition() {
      const { $ut, manyOptions, value } = this
        return {
          whereList: [{condition: 'notIn', value}],
          description: $ut('notContains') + ' ' + manyOptions
        }
    },
    submitHandler() {
      this.$emit('search', this.getCondition())
    }
  }
}
</script>
