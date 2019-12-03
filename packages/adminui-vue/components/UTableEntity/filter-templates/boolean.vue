<template>
  <div>
    <el-select
      v-model="condition"
      class="u-table-entity__filter__input"
      :placeholder="$ut('table.filter.conditionPlaceholder')"
      @keydown.native.enter="$refs.submit.$el.click"
    >
      <el-option
        v-for="option in filters"
        :key="option"
        :value="option"
        :label="$ut(option)"
      />
    </el-select>

    <filter-submit-button
      ref="submit"
      :disabled="condition === null"
      @click="buildFilterParam"
    />
  </div>
</template>

<script>
const FilterSubmitButton = require('../components/FilterSubmitButton.vue').default
const { mapActions } = require('vuex')

export default {
  components: { FilterSubmitButton },

  data () {
    return {
      condition: null,
      filters: [
        'Yes',
        'No',
        'isNull'
      ]
    }
  },

  methods: {
    ...mapActions(['applyFilter']),

    buildFilterParam () {
      if (this.condition === 'isNull') {
        this.applyFilter({
          whereList: [{ condition: this.condition }],
          description: 'isNull'
        })
      } else if (this.condition === 'Yes') {
        this.applyFilter({
          whereList: [{ condition: 'equal', value: true }],
          description: this.$ut('equal') + ' ' + this.$ut('Yes')
        })
      } else if (this.condition === 'No') {
        this.applyFilter({
          whereList: [{ condition: 'equal', value: false }],
          description: this.$ut('equal') + ' ' + this.$ut('No')
        })
      }
    }
  }
}
</script>
