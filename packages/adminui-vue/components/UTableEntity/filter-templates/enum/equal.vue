<template>
  <filter-template
    :button-disabled="value === null"
    @submit="submitHandler"
  >
    <u-select-enum
      v-model="value"
      :e-group="eGroup"
    />
  </filter-template>
</template>

<script>
export default {
  name: 'FilterEnumEqual',

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
      value: null,
      condition: 'equal'
    }
  },

  computed: {
    eGroup () {
      return this.column.attribute.enumGroup
    },

    formattedValue () {
      return this.$lookups.get('ubm_enum', {
        eGroup: this.eGroup,
        code: this.value
      })
    }
  },
  methods: {
    getCondition () {
      const { $ut, condition, value, formattedValue } = this
      return {
        whereList: [{ condition, value }],
        description: $ut(condition) + ' ' + formattedValue
      }
    },
    submitHandler () {
      this.$emit('search', this.getCondition())
    }
  }
}
</script>
