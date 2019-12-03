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
      <el-date-picker
        v-model="rangeValue"
        type="daterange"
        range-separator="-"
        :start-placeholder="$ut('startDate')"
        :end-placeholder="$ut('endDate')"
        :picker-options="dateRangeOptions"
      />

      <filter-submit-button
        :disabled="rangeValue === null"
        @click="applyFilter({
          whereList: rangeWhereList,
          description: `${$ut('table.filter.date.from')} ${$moment(rangeValue[0]).format('ll')} ${$ut('table.filter.date.to')} ${$moment(rangeValue[1]).format('ll')}`
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

    <template v-else-if="condition === 'date'">
      <el-date-picker
        v-model="value"
        type="date"
        :placeholder="$ut('table.filter.date.valuePlaceholder')"
      />
      <filter-submit-button
        :disabled="value === null"
        @click="applyFilter({
          whereList: onDateWhereList,
          description: $ut(condition) + ' ' + $moment(value).format('ll')
        })"
      />
    </template>

    <template v-else-if="condition === 'from_date'">
      <el-date-picker
        v-model="value"
        type="date"
        :placeholder="$ut('table.filter.date.valuePlaceholder')"
      />
      <filter-submit-button
        :disabled="value === null"
        @click="applyFilter({
          whereList: [{condition: 'moreEqual', value}],
          description: $ut(condition) + ' ' + $moment(value).format('ll')
        })"
      />
    </template>

    <template v-else-if="condition === 'to_date'">
      <el-date-picker
        v-model="value"
        type="date"
        :placeholder="$ut('table.filter.date.valuePlaceholder')"
      />
      <filter-submit-button
        :disabled="value === null"
        @click="applyFilter({
          whereList: [{ condition: 'less', value: addDay(value) }],
          description: $ut(condition) + ' ' + $moment(addDay(value)).format('ll')
        })"
      />
    </template>
  </div>
</template>

<script>
const FilterSubmitButton = require('../components/FilterSubmitButton.vue').default
const { mapActions } = require('vuex')

export default {
  components: { FilterSubmitButton },

  data () {
    return {
      condition: 'range',
      value: null,
      rangeValue: null,
      filters: ['from_date', 'to_date', 'date', 'isNull', 'range'],
      dateRangeOptions: {
        shortcuts: [{
          text: this.$ut('lastMonth'),
          onClick: (picker) => {
            const end = new Date()
            const start = this.$moment().subtract(1, 'month').valueOf()
            picker.$emit('pick', [start, end])
          }
        }, {
          text: this.$ut('lastQuarter'),
          onClick: (picker) => {
            const end = new Date()
            const start = this.$moment().subtract(3, 'month').valueOf()
            picker.$emit('pick', [start, end])
          }
        }, {
          text: this.$ut('last6Month'),
          onClick: (picker) => {
            const end = new Date()
            const start = this.$moment().subtract(6, 'month').valueOf()
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },

  computed: {
    rangeWhereList () {
      return [
        { condition: 'moreEqual', value: this.rangeValue[0] },
        { condition: 'less', value: this.addDay(this.rangeValue[1]) }
      ]
    },

    onDateWhereList () {
      return [
        { condition: 'moreEqual', value: this.value },
        { condition: 'less', value: this.addDay(this.value) }
      ]
    }
  },

  methods: {
    ...mapActions(['applyFilter']),

    addDay (date) {
      const moment = this.$moment(date)
      moment.add(1, 'day')
      return moment.toDate()
    }
  }
}
</script>
