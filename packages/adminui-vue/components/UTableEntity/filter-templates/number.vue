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

    <template v-if="condition === 'range'">
      <u-base-input
        v-model="rangeValueFrom"
        :placeholder="$ut('table.filter.date.from')"
        class="u-table-entity__filter__input"
        type="number"
        @keydown.native.enter="$refs.submit.$el.click"
      />
      -
      <u-base-input
        v-model="rangeValueTo"
        :placeholder="$ut('table.filter.date.to')"
        class="u-table-entity__filter__input"
        type="number"
        @keydown.native.enter="$refs.submit.$el.click"
      />

      <filter-submit-button
        ref="submit"
        :disabled="isEmpty(rangeValueFrom) && isEmpty(rangeValueTo)"
        @click="applyFilter({
          whereList: rangeWhereList,
          description: `${$ut('table.filter.date.from')} ${rangeValueFrom} ${$ut('table.filter.date.to')} ${rangeValueTo} `
        })"
      />
    </template>

    <filter-submit-button
      v-else-if="condition === 'isNull'"
      @click="applyFilter({
        whereList: [{condition}],
        description: 'isNull'
      })"
    />

    <template v-else>
      <u-base-input
        v-model="value"
        :placeholder="$ut('table.filter.valuePlaceholder')"
        class="u-table-entity__filter__input"
        type="number"
        @keydown.native.enter="$refs.submit.$el.click"
      />

      <filter-submit-button
        ref="submit"
        :disabled="value === null || value === ''"
        @click="applyFilter({
          whereList: [{condition, value}],
          description: $ut(condition) + ' ' + value
        })"
      />
    </template>
  </div>
</template>

<script>
const FilterSubmitButton = require('../components/filter-submit-button.vue').default
const { mapActions } = require('vuex')

export default {
  components: { FilterSubmitButton },

  data () {
    return {
      condition: 'equal',
      value: null,
      rangeValueFrom: null,
      rangeValueTo: null,
      filters: [
        'more',
        'less',
        'equal',
        'range',
        'isNull'
      ]
    }
  },

  computed: {
    rangeWhereList () {
      const whereList = []
      if (this.rangeValueFrom) {
        whereList.push({ condition: 'moreEqual', value: this.rangeValueFrom })
      }

      if (this.rangeValueTo) {
        whereList.push({ condition: 'lessEqual', value: this.rangeValueTo })
      }

      return whereList
    }
  },

  methods: {
    ...mapActions(['applyFilter']),

    isEmpty (value) {
      return value === null || value === ''
    }
  }
}
</script>
