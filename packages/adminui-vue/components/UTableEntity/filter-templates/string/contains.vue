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
  name: 'FilterStringContains',

  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },

  props: ['defaultValue'],

  data () {
    return {
      value: '',
      condition: 'contains'
    }
  },
  created(){
    if (this.defaultValue !== undefined) this.value = this.defaultValue
  },
  computed: {
    isEmpty () {
      return this.value === '' || this.value === null
    }
  },
  watch: {
    isEmpty:{
      immediate: true,
      handler(newValue){
        this.$emit('search-disabled', newValue)
      }
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
