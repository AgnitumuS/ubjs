<template>
  <filter-template
    :button-disabled="isEmpty"
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
  name: 'FilterEnumNotEqual',

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
      condition: 'notEqual'
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
    },

    isEmpty () {
      return this.value === '' || this.value === null
    }
  },
  
  methods: {
    getCondition () {
      const { $ut, value, condition, formattedValue } = this
      return {
        whereList: [{ condition, value }],
        description: $ut(condition) + ' ' + formattedValue
      }
    }
  }
}
</script>
