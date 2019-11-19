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

    <template v-if="condition === 'contains'">
      <u-select-multiple
        ref="selectMany"
        v-model="value"
        class="u-table-entity__filter__select-multiple"
        :entity-name="entity"
        :placeholder="$ut('table.filter.valuePlaceholder')"
      />

      <filter-submit-button
        :disabled="value.length === 0"
        @click="applyFilter({
          whereList: [{condition: 'in', value}],
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
const FilterSubmitButton = require('../components/filter-submit-button.vue').default
const { mapGetters, mapActions } = require('vuex')

export default {
  components: { FilterSubmitButton },

  data () {
    return {
      condition: 'contains',
      value: [],
      filters: [
        'contains',
        'isNull'
      ]
    }
  },

  computed: {
    ...mapGetters(['selectedColumn']),

    entity () {
      return this.selectedColumn.attribute.associatedEntity
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
    }
  },

  methods: mapActions(['applyFilter'])
}
</script>
