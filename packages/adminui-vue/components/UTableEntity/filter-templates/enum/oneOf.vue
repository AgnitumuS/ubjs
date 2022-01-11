<template>
  <filter-template
    :button-disabled="value.length === 0"
    @submit="submitHandler"
  >
    <u-select-multiple
      ref="selectMany"
      v-model="value"
      value-attribute="code"
      :repository="repository"
    />
  </filter-template>
</template>

<script>
export default {
  name: 'FilterEnumContains',

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
    }
  },

  methods: {
    repository () {
      return this.$UB.Repository('ubm_enum')
        .attrs('code', 'name', 'eGroup')
        .where('eGroup', '=', this.column.attribute.enumGroup)
    },
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
