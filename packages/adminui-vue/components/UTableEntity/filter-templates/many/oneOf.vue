<template>
<!--  whereList: [{ condition: '=', value }] - for the "many" type there must be exactly "=",
 otherwise there will be an error when choosing single value -->
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
  name: 'FilterManyContains',

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
    getCondition () {
      const { $ut, value, manyOptions } = this
      return {
        whereList: [{ condition: '=', value }],
        description: $ut('by_several_value') + ' ' + manyOptions
      }
    }
  }
}
</script>
