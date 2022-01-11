<template>
  <filter-template
    :button-disabled="isEmpty"
    @submit="submitHandler"
  >
    <div class="u-table-entity-filter__date-range">
      <u-base-input
        v-model="valueFrom"
        class="u-table-entity-filter__date-range-input"
        :placeholder="$ut('table.filter.date.from')"
        type="number"
      />
      <div class="u-table-entity-filter__date-range-divider">
        -
      </div>
      <u-base-input
        v-model="valueTo"
        class="u-table-entity-filter__date-range-input"
        :placeholder="$ut('table.filter.date.to')"
        type="number"
      />
    </div>
  </filter-template>
</template>

<script>
export default {
  name: 'FilterNumberRange',

  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },

  data () {
    return {
      valueFrom: 0,
      valueTo: 0
    }
  },

  computed: {
    isEmpty () {
      return this.testEmpty(this.valueFrom) && this.testEmpty(this.valueTo)
    },
    whereList () {
      const whereList = []
      if (this.valueFrom) {
        whereList.push({ condition: 'moreEqual', value: this.valueFrom })
      }

      if (this.valueTo) {
        whereList.push({ condition: 'lessEqual', value: this.valueTo })
      }

      return whereList
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
    testEmpty (value) {
      return value === null || value === ''
    },
    getCondition () {
      const { $ut, whereList, valueTo, valueFrom } = this
      return {
        whereList,
        description: `${$ut('table.filter.date.from')} ${valueFrom} ${$ut('table.filter.date.to')} ${valueTo} `
      }
    },
    submitHandler () {
      this.$emit('search', this.getCondition())
    }
  }
}
</script>

<style>
.u-table-entity-filter__date-range {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.u-table-entity-filter__date-range-input {
  max-width: 100px;
}

.u-table-entity-filter__date-range-divider {
  padding: 0 12px;
}
</style>
