<template>
  <filter-template
    :button-disabled="isEmpty"
    @submit="submitHandler"
  >
    <u-base-input
      v-model="value"
      type="number"
    />
  </filter-template>
</template>

<script>
export default {
  name: 'FilterNumberMore',

  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },

  data () {
    return {
      value: null,
      condition: 'more'
    }
  },

  computed: {
    isEmpty () {
      return this.value === '' || this.value === null
    }
  },
  methods: {
    getCondition () {
      const { $ut, value, condition } = this
      return {
        whereList: [{ condition, value }],  
        description: $ut(condition) + ' ' + value 
      } 
    },
    submitHandler () {
      this.$emit('search', this.getCondition())
    }
  }
}
</script>
