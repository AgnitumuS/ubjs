<template>
  <u-dropdown
    v-if="filterColumns.length > 0"
    ref="dropdown"
    custom-class="filter-selector"
    @close="closeDropdownHandler"
  >
    <u-button
      :title="$ut('table.filter.list.title')"
      appearance="inverse"
      color="control"
      icon="u-icon-filter"
    />

    <div slot="dropdown" class="filter-selector__main">
      <div class="filter-selector__header">
        <u-button
          @click.native="searchHandler"
          :disabled="disabledSearchBtn"
          type="submit"
          icon="u-icon-search"
          color="primary"
          size="small"
          >{{ $ut('search') }}</u-button
        >
        <u-button
          @click="counterHandler"
          type="submit"
          icon="u-icon-add"
          color="success"
          size="small"
          appearance="plain"
          >{{ $ut('add') }}</u-button
        >
      </div>
      <div class="filter-selector__body">
        <u-filter
          v-for="(item, index) in length"
          :key="selectedColumns[index]?.id || index"
          :columns="filterColumns"
          @selected-column="selectedColumnHandler($event, index)"
          @remove-filter="removeFilterHandler(index)"
          :search-disabled=" ($event) => { searchDisabledHandler($event, index) }"
          :can-remove="length > 1"
          :selected-column="selectedColumns[index]"
          ref="filterItem"
        ></u-filter>
      </div>
    </div>
  </u-dropdown>
</template>

<script>
  const { mapGetters } = require('vuex');

  export default {
    components: {
      UFilter: require('./Filter.vue').default
    },
    data() {
      return {
        length: 1,
        currentColumn: [],
        selectedColumns: [],
        disabledSearchBtn: true
      };
    },

    computed: {
      ...mapGetters(['columns']),
      availableColumns() {
        const result = this.columns.filter((column) => {
          const availableFilters = Object.keys(column.filters);
          const hasFilters = availableFilters.length > 0;
          const everyFilterHasTemplate = availableFilters.every(
            (filterCode) => column.filters[filterCode].template
          );

          return hasFilters && everyFilterHasTemplate;
        });
        return result;
      },
      filterColumns() {
        return this.availableColumns.filter((item) => {
          const index = this.selectedColumns.findIndex(
            (el) => el.id === item.id
          );
          return index === -1;
        });
      }
    },
    mounted() {
      this.restoreFilters()
    },
    methods: {
      closeDropdownHandler(){
        this.restoreFilters()
      },
      restoreFilters(){
        const { filters } = this.$store.state
        if (!filters || !filters.length) return;
        const {availableColumns}  = this
        this.selectedColumns.splice(0)
        filters.forEach(item => {
          if (!item.whereList) return;
            const firstList = item.whereList[0]
            const column = availableColumns.find(i => i.id === firstList.expression)
            if (!column) return
            column.condition = firstList.condition
            column.value = firstList.value
            this.selectedColumns.push(column)
            const secondtList = item.whereList[1]
            if (!secondtList) return
            column.condition = 'range'
            column.value = [firstList.value, secondtList.value]
        })
        this.length = this.selectedColumns.length
      },
      setDisabledSearchBtn(){
        let flag = true
        if (this.selectedColumns.length < this.length) {
          flag = true
        } else {
        flag = this.selectedColumns.some(i => {
          if (!Object.keys(i).length) return true
          return i.searchDisabled
        })
        }
        this.disabledSearchBtn = flag
      },
      searchDisabledHandler(value, index){
        const target = this.selectedColumns[index]
        if (!target) return
        target.searchDisabled = !!value
        this.setDisabledSearchBtn()
      },
      selectedColumnHandler(columnId, index) {
        const column =
          this.availableColumns.find((item) => item.id === columnId) || {};
          column.disabled = false
        this.selectedColumns.splice(index, 1, column);
        this.setDisabledSearchBtn()
      },
      counterHandler() {
        if (this.length === this.availableColumns.length) return;
        ++this.length;
        this.setDisabledSearchBtn()
      },
      async searchHandler() {
        const { selectedColumns, $store } = this;
        this.$store.commit('CLEAR_FILTER')
        this.$refs.filterItem.forEach((comp, index) => {
          const el = comp.$refs.searchComponent;
          const condition = el.getCondition();
          const column = selectedColumns[index];
          $store.commit('APPLY_FILTER', {
            columnId: column.id,
            label: column.label,
            description: condition.description,
            whereList: condition.whereList.map((whereItem) => ({
              ...whereItem,
              expression: whereItem.expression || column.id
            }))
          });
        });
        this.$refs.dropdown.close()
        await this.$store.dispatch('fetchItems');
      },
      removeFilterHandler(index) {
        const deletedFilter = this.selectedColumns.splice(index, 1)[0];
        --this.length;
        if (deletedFilter && deletedFilter.id) {
          delete deletedFilter.value
          delete deletedFilter.condition
        }
        this.setDisabledSearchBtn()
      }
    },
  };
</script>

<style>
  .filter-selector__main {
    /* color: blue; */
    max-height: 100vh;
    max-width: 70vw;
    display: flex;
    flex-direction: column;
  }
  .filter-selector__header {
    display: flex;
    padding: 10px;
  }
  .filter-selector__header .u-button {
    margin-right: 10px;
  }
  .filter-selector {
    box-shadow: var(--box-shadow-default);
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  }
</style>
