<template>
  <div>
    <el-select
      v-model="condition"
      class="u-table-entity__filter__input"
      :placeholder="$ut('table.filter.conditionPlaceholder')"
    >
      <el-option
        v-for="option in filters"
        :key="option"
        :value="option"
        :label="$ut(option)"
      />
    </el-select>

    <u-base-input
      v-model="value"
      :placeholder="$ut('table.filter.valuePlaceholder')"
      class="u-table-entity__filter__input"
      :min="0"
      type="number"
      @keydown.native.enter="$refs.submit.$el.click"
    />

    <filter-submit-button
      ref="submit"
      :disabled="value === null || value === ''"
      @click="applyFilter({
        whereList: [{ condition, value }],
        description: $ut(condition) + ' ' + value
      })"
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
      condition: 'equal',
      value: null,
      filters: [
        'equal',
        'contains'
      ]
    }
  },

  methods: mapActions(['applyFilter'])
}
</script>
