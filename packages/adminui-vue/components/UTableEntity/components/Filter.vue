<template>
  <div class="u-fake-table filter-item">
    <div class="u-fake-table__body">
      <div class="u-fake-table__tr">
        <div class="u-fake-table__td u-fake-table__label">
          {{ $ut('table.columnLabel') }}
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
            {{ $ut('table.filter.conditionPlaceholder') }}
          </div>
          <div class="u-fake-table__td">
            <el-select
              v-model="condition"
              :placeholder="$ut('table.filter.conditionPlaceholder')"
            >
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
          ref="searchComponent"
        />
      </template>
    </div>
    <div class="u-fake-table__header">
      <u-icon
        v-if="canRemove"
        @click.native="$emit('remove-filter')"
        class="u-fake-table--icon"
        color="danger"
        icon="u-icon-close"
        size="small"
      />
    </div>
  </div>
</template>

<script>
  const { mapActions } = require('vuex');
  const { throttle } = require('throttle-debounce');

  export default {
    props: {
      columns: {
        type: Array,
        default: () => {
          [];
        }
      },
      selectedColumn: {
        type: Object,
        default: () => ({})
      },
      canRemove: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        conditionsByColumns: {}
      };
    },
    watch: {
      selectedColumn: function(value) {
        this.selectedColumnId = value.id;
      }
    },
    computed: {
      currentColumns() {
        const result =
          Object.keys(this.selectedColumn).length > 0
            ? [this.selectedColumn, ...this.columns]
            : this.columns;
        return result;
      },
      selectedColumnId: {
        get() {
          return this.$store.state.selectedColumnId;
        },

        set(value) {
          this.$store.commit('SELECT_COLUMN', value);
        }
      },

      selectedFilterableColumnId: {
        get() {
          return this.selectedColumn.id || null;
        },

        set(value) {
          this.$emit('selected-column', value);
          this.selectedColumnId = value;
        }
      },

      condition: {
        get() {
          return this.conditionsByColumns[this.selectedFilterableColumnId];
        },

        set(value) {
          this.conditionsByColumns[this.selectedFilterableColumnId] = value;
        }
      }
    },
    created() {
      this.init();
    },
    methods: {
      init() {
        this.$set(this, 'conditionsByColumns', {});
        for (const column of this.currentColumns) {
          this.$set(
            this.conditionsByColumns,
            column.id,
            Object.keys(column.filters)[0]
          );
        }
      }
    }
  };
</script>

<style>
  .u-fake-table.filter-item {
    display: flex;
    align-items: center;
  }
  .u-fake-table.filter-item .u-fake-table__tbody .u-button {
    display: none;
  }

  .u-fake-table.filter-item .u-fake-table__label {
    white-space: nowrap;
  }
  .u-fake-table.filter-item .u-fake-table__td .el-range-editor.el-input__inner {
    max-width: 100%;
  }
  .u-fake-table.filter-item .u-fake-table__td {
    max-width: 220px;
  }
  .u-fake-table__header .u-icon_size-small {
    font-size: 14px;
    cursor: pointer;
  }
</style>
