<template>
  <filter-template
    :button-disabled="isEmpty"
    @submit="submitHandler"
  >
    <el-input v-model="value" />
  </filter-template>
</template>

<script>
export default {
  name: 'FilterStringStartWith',

  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },

  mixins: [require('../mixinForFilter.js')],

  data () {
    return {
      value: '',
      condition: 'equal'
    }
  },

  computed: {
    isEmpty () {
      return this.value === '' || this.value === null
    }
  },
  methods: {
    getCondition () {
      const { $ut, condition, value } = this
      return {
        whereList: [{ condition, value }],
        description: $ut(condition) + ' ' + value
      }
    },
  }
}
</script>
