<template>
  <u-dropdown v-if="filterColumns.length > 0" ref="dropdown">
    <u-button
      :title="$ut('table.filter.list.title')"
      appearance="inverse"
      color="control"
      icon="u-icon-filter"
    />

    <div slot="dropdown">
      <button @click="counterHandler">Add</button>
      <button @click="searchHandler">Search</button>
      <div class="filter-selector__body">
        <u-filter
          v-for="(item, index) in length"
          :key="index"
          :columns="filterColumns"
          @selected-column="selectedColumnHandler($event, index)"
          :selected-column="selectedColumns[index]"
          ref="filterItem"
        ></u-filter>
      </div>
    </div>
  </u-dropdown>
</template>

<script>
const { mapGetters } = require("vuex");

export default {
  components: {
    UFilter: require("./Filter.vue").default,
  },
  data() {
    return {
      length: 1,
      currentColumn: [],
      selectedColumns: [],
    };
  },

  computed: {
    ...mapGetters(["columns"]),
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
        const index = this.selectedColumns.findIndex((el) => el.id === item.id);
        return index === -1;
      });
    },
  },
  created() {
    this.selectedColumns = this.filterColumns.map(() => ({}));
  },
  methods: {
    selectedColumnHandler(columnId, index) {
      const column =
        this.availableColumns.find((item) => item.id === columnId) || {};
      this.selectedColumns.splice(index, 1, column);
    },
    counterHandler() {
      if (this.length === this.availableColumns.length) return;
      ++this.length;
    },
    searchHandler() {
      const { selectedColumns, $store } = this;
      this.$refs.filterItem.forEach((comp, index) => {
        const el = comp.$refs.searchComponent;
        const condition = el.getCondition();
        const column = selectedColumns[index];
        $store.commit("APPLY_FILTER", {
          columnId: column.id,
          label: column.label,
          description: condition.description,
          whereList: condition.whereList.map((whereItem) => ({
            ...whereItem,
            expression: whereItem.expression || column.id,
          })),
        });
      });
      this.$store.dispatch("fetchItems");
    },
  },
};
</script>

<style>
.filter-selector__body {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}
.filter-selector__body .u-fake-table .u-fake-table__tbody .u-button {
  display: none;
}
</style>
