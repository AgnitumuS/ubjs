<template>
  <filter-template
    :button-disabled="isEmpty"
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
  name: 'FilterEntityContains',

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

    isEmpty () {
      const { value } = this
      return value === '' || value === null || value.length === 0
    }
  },

  // this hook will be call after call hook in mixin
  created () {
    if (!Array.isArray(this.value)) this.value = []
  },

  methods: {
    getCondition () {
      const { $ut, value, manyOptions } = this
      return {
        whereList: [{condition: 'in', value}],
        description: $ut('by_several_value') + ' ' + manyOptions
      }
    }
  }
}
</script>
