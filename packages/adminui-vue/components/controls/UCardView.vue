<template>
  <div class="u-card-container">
    <div class="u-card-grid">
      <div
        v-for="row in items"
        :key="row.ID"
        class="u-card"
        :class="getCardClass(row)"
        @click="$emit('click', {row})"
        @dblclick="$emit('dblclick', row.ID)"
        @contextmenu="$emit('contextmenu', {event: $event, row})"
      >
        <slot
          name="card"
          :row="row"
        >
          <div
            v-for="column in columns"
            :key="column.id"
            class="u-card-row"
          >
            <div class="u-card-row__label">
              {{ $ut(column.label) }}
            </div>

            <el-tooltip
              :enterable="false"
              :open-delay="300"
            >
              <component
                :is="getCellTemplate(column)"
                slot="content"
                :column="column"
                :row="row"
                :value="row[column.id]"
              />
              <component
                :is="getCellTemplate(column)"
                class="u-card-row__value"
                :column="column"
                :row="row"
                :value="row[column.id]"
              />
            </el-tooltip>
          </div>
        </slot>
      </div>
    </div>
    <!-- @slot Table footer -->
    <slot name="append" />
  </div>
</template>

<script>
const TypeProvider = require('../UTableEntity/type-provider')

/**
 * View data as cards. Did not registered globally
 */
export default {
  name: 'UCardView',

  mixins: [require('./UTable/formatValueMixin')],

  props: {
    /**
     * Array of columns settings where each item can be string or object.
     * For detail info about column object look JSDoc type {UTableColumn}
     */
    columns: {
      type: Array,
      required: true
    },

    /**
     * Table data
     */
    items: {
      type: Array,
      required: true
    },

    /**
     * Function that returns custom class names for each card
     *
     * @param {object} row Current card data
     */
    getCardClass: {
      type: Function,
      default: () => () => {}
    }
  },

  methods: {
    getCellTemplate (column) {
      if (typeof column.template === 'function') {
        return column.template()
      } else {
        const dataType = column.attribute && column.attribute.dataType
        return TypeProvider.get(dataType).template
      }
    }
  }
}
</script>

<style>
.u-card-container {
  overflow: auto;
  background: hsl(var(--hs-background), var(--l-background-default));
  flex-grow: 1;
  border-top: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
}

.u-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  padding: 12px;
  grid-gap: 12px;
}

.u-card {
  box-shadow: 0 2px 8px hsla(var(--hs-text), var(--l-text-default), 0.2);
  padding: 16px 12px;
  border-radius: var(--border-radius);
  background: hsl(var(--hs-background), var(--l-background-inverse));
}

.u-card-row {
  font-size: 14px;
  display: flex;
  margin-bottom: 12px;
  white-space: nowrap;
}

.u-card-row:last-child {
  margin-bottom: 0;
}

.u-card-row__label {
  margin-right: 8px;
  color: hsl(var(--hs-text), var(--l-text-label));
}

.u-card-row__label:after {
  content: ':';
}

.u-card-row__value {
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
