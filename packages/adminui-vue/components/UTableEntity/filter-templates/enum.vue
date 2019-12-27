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

    <template v-if="condition === 'equal'">
      <u-select-enum
        v-model="value"
        :e-group="eGroup"
        :placeholder="$ut('table.filter.valuePlaceholder')"
        @keydown.native.enter="$refs.submit.$el.click"
      />

      <filter-submit-button
        ref="submit"
        :disabled="value === null"
        @click="applyFilter({
          whereList: [{ condition, value }],
          description: $ut(condition) + ' ' + formattedValue
        })"
      />
    </template>

    <template v-else-if="condition === 'contains'">
      <u-select-multiple
        ref="selectMany"
        v-model="valueMany"
        class="u-table-entity__filter__select-multiple"
        value-attribute="code"
        :repository="manyRepository"
        :placeholder="$ut('table.filter.valuePlaceholder')"
      />

      <filter-submit-button
        :disabled="valueMany.length === 0"
        @click="applyFilter({
          whereList: [{condition: 'in', value: valueMany}],
          description: $ut('contains') + ' ' + manyOptions
        })"
      />
    </template>

    <filter-submit-button
      v-else
      @click="applyFilter({
        whereList: [{condition}],
        description: 'isNull'
      })"
    />
  </div>
</template>

<script>

const FilterSubmitButton = require('../components/FilterSubmitButton.vue').default
const { mapGetters, mapActions } = require('vuex')
const Lookups = require('../../../utils/lookups.js')

export default {
  components: { FilterSubmitButton },

  data () {
    return {
      condition: 'equal',
      value: null,
      valueMany: [],
      filters: ['equal', 'contains', 'isNull']
    }
  },

  computed: {
    ...mapGetters(['selectedColumn']),

    eGroup () {
      return this.selectedColumn.attribute.enumGroup
    },

    manyOptions () {
      const selectMany = this.$refs.selectMany
      if (selectMany) {
        return selectMany.displayedOptions
          .map(o => o.label)
          .join(', ')
      } else {
        return []
      }
    },

    formattedValue () {
      return Lookups.getEnumValue(this.eGroup, this.value)
    }
  },

  methods: {
    ...mapActions(['applyFilter']),

    manyRepository () {
      return this.$UB.Repository('ubm_enum')
        .attrs('code', 'name', 'eGroup')
        .where('eGroup', '=', this.eGroup)
    }
  }
}
</script>
