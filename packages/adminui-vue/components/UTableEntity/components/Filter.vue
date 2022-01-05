<template>
  <div class="u-fake-table">
    <div class="u-fake-table__tr">
      <div class="u-fake-table__td u-fake-table__label">
        {{ $ut("table.columnLabel") }}
      </div>
      <div class="u-fake-table__td">
        <el-select
          v-model="selectedFilterableColumnId"
          :placeholder="$ut('table.filter.columnPlaceholder')"
        >
          <el-option
            v-for="column in currentColumns"
            :key="column.id"
            :value="column.id"
            :label="$ut(column.label)"
          />
        </el-select>
      </div>
    </div>

    <template v-if="selectedFilterableColumnId">
      <div class="u-fake-table__tr">
        <div class="u-fake-table__td u-fake-table__label">
          {{ $ut("table.filter.conditionPlaceholder") }}
        </div>
        <div class="u-fake-table__td">
          <el-select v-model="condition" :placeholder="$ut('table.filter.conditionPlaceholder')">
            <el-option
              v-for="(filterData, filterId) in selectedColumn.filters"
              :key="filterId"
              :value="filterId"
              :label="$ut(filterData.label)"
            />
          </el-select>
        </div>
      </div>

      <component
        :is="selectedColumn.filters[condition].template"
        v-if="selectedColumn.filters && selectedColumn.filters[condition]"
        :column="selectedColumn"
        @search="throttledApplyFilter"
        ref="searchComponent"
      />
    </template>
  </div>
</template>

<script>
const { mapActions } = require("vuex");
const { throttle } = require("throttle-debounce");

export default {
  props: {
    columns: {
      type: Array,
      default: () => {
        [];
      },
    },
    selectedColumn: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      conditionsByColumns: {},
    };
  },
watch: {
  selectedColumn: function(value){
    this.selectedColumnId = value.id
  }
},
  computed: {
    currentColumns(){
      const result  = Object.keys(this.selectedColumn).length > 0 ?  [this.selectedColumn, ...this.columns] : this.columns
      return result
    },
    selectedColumnId: {
      get() {
        return this.$store.state.selectedColumnId;
      },

      set(value) {
        this.$store.commit("SELECT_COLUMN", value);
      },
    },

    selectedFilterableColumnId: {
      get() {
        return this.selectedColumn.id || null;
      },

      set(value) {
        this.$emit("selected-column", value);
        this.selectedColumnId = value;
      },
    },

    condition: {
      get() {
        return this.conditionsByColumns[this.selectedFilterableColumnId];
      },

      set(value) {
        this.conditionsByColumns[this.selectedFilterableColumnId] = value;
      },
    },
  },
  created() {
    this.init();
  },
  methods: {
    ...mapActions(["applyFilter"]),

    throttledApplyFilter: throttle(50, function (...args) {
      this.applyFilter(...args);
    }),

    init() {
      this.$set(this, "conditionsByColumns", {});
      for (const column of this.currentColumns) {
        this.$set(
          this.conditionsByColumns,
          column.id,
          Object.keys(column.filters)[0]
        );
      }
    },

  },
};
</script>
