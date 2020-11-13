<template>
  <div
    class="u-table"
    :style="tableStyle"
  >
    <table>
      <tr>
        <th
          v-for="col in columns"
          :key="col.id"
          :class="[
            { 'u-table__fixed-column': col.id === fixedColumnId },
            getAlignClass(col.headerAlign),
            columnsClasses[col.id]
          ]"
          :style="{
            maxWidth: col.maxWidth && col.maxWidth + 'px',
            minWidth: col.minWidth && col.minWidth + 'px',
            width: col.width && col.width + 'px',
            padding: col.padding && col.padding + 'px'
          }"
          @click="$emit('click-head-cell', col)"
        >
          <slot
            :name="`head_${col.id}`"
            :column="col"
          >
            {{ formatHead({ column: col }) }}
          </slot>
        </th>
      </tr>
      <tr
        v-for="row in items"
        :key="row.ID"
        :class="getRowClass(row)"
        @dblclick="$emit('dblclick-row', {row})"
        @click="$emit('click-row', {row})"
      >
        <td
          v-for="col in columns"
          :key="col.id"
          :class="[
            {
              'u-table__fixed-column': col.id === fixedColumnId,
            },
            getAlignClass(col.align),
            columnsClasses[col.id],
            getCellClass(row, col)
          ]"
          :style="{
            padding: col.padding && col.padding + 'px'
          }"
          @click="$emit('click-cell', {row, column: col})"
          @contextmenu="$emit('contextmenu-cell', {event: $event, row, column: col})"
        >
          <div class="u-table__cell-container">
            <slot
              :name="col.id"
              :value="row[col.id]"
              :row="row"
              :column="col"
            >
              {{ formatValue({ value: row[col.id], column: col, row }) }}
            </slot>
          </div>
        </td>
      </tr>
      <!-- @slot Last row in table -->
      <slot name="lastTableRow" />
    </table>
    <div
      v-if="items.length === 0"
      class="u-table-no-data"
    >
      {{ $ut('UTable.noData') }}
    </div>
    <!-- @slot Table footer -->
    <slot name="appendTable" />
  </div>
</template>

<script>
export default {
  name: 'UTable',

  mixins: [
    require('./formatValueMixin')
  ],

  props: {
    /**
     * Array of objects which includes column settings.
     * For detail info about column object look JSDoc type {UTableColumn}
     */
    columns: {
      type: Array,
      required: true
    },

    /**
     * Id of column which will stack when we scroll table by horizontal.
     */
    fixedColumnId: String,

    /**
     * Table data
     */
    items: {
      type: Array,
      required: true
    },

    /**
     * Function that returns custom class names for a column assigning class names for every cell in column
     *
     * @param {UTableColumn} column Current column
     */
    getColumnClass: {
      type: Function,
      default () {
        return ''
      }
    },

    /**
     * Function that returns custom class names for a row assigning class names for every row
     *
     * @param {object} row Current row
     */
    getRowClass: {
      type: Function,
      default () {
        return ''
      }
    },

    /**
     * Function that returns custom class names for a cell
     * !!WARNING!! Do not use complex calculations since the method is called for each cell separately
     *
     * @param {object} row Current row
     * @param {UTableColumn} column Current column
     */
    getCellClass: {
      type: Function,
      default () {
        return ''
      }
    },

    /**
     * If set table will be have static height.
     * Table container will be have own scroll and fixed header.
     */
    height: [Number, String],

    /**
     * If set table will be have maxHeight.
     * Table container will be have own scroll and fixed header.
     */
    maxHeight: [Number, String]
  },

  computed: {
    tableStyle () {
      return ['height', 'maxHeight'].reduce((style, prop) => {
        const value = this[prop]
        if (value) {
          style.overflow = 'auto'

          if (typeof value === 'number') {
            style[prop] = value + 'px'
          } else {
            style[prop] = value
          }
        }
        return style
      }, {})
    },

    columnsClasses () {
      return this.columns.reduce((accum, column) => {
        accum[column.id] = this.getColumnClass(column)
        return accum
      }, {})
    }
  },

  methods: {
    getAlignClass (align = 'left') {
      return `u-table__cell__align-${align}`
    }
  }
}
</script>

<style>
.u-table {
  --border: hsl(var(--hs-border), var(--l-layout-border-default));
  --text:  hsl(var(--hs-text), var(--l-text-default));
  --header-text: hsl(var(--hs-text), var(--l-text-label));
  --border-hover: hsl(var(--hs-border), var(--l-layout-border-light));
  --row-hover: hsl(var(--hs-background), var(--l-background-default));
  --cell-hover: hsl(var(--hs-background), var(--l-background-active));
}

.u-table table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.u-table__cell__align-left{
  text-align: left;
}
.u-table__cell__align-center{
  text-align: center;
}
.u-table__cell__align-right{
  text-align: right;
}

.u-table td,
.u-table th{
  border-bottom: 1px solid var(--border);
  color: var(--text);
  padding: 10px 8px;
  font-size: 14px;
  position: relative;
  letter-spacing: 0.3px;
  background: hsl(var(--hs-background), var(--l-background-inverse));
}

.u-table th {
  padding-left: 10px;
}

.u-table__cell-container{
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.u-table th {
  border-top: 1px solid var(--border);
  top: 0;
  z-index: 1;
  position: sticky;
  color: hsla(60, 0%, 50%, 1);;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  background: hsla(180, 7%, 89%, 1);
}

.u-table th:after{
  content: '';
  width: 1px;
  height: 28px;
  position: absolute;
  top: calc(50% - 14px);
  right: 0;
  background: var(--border);
}

.u-table th:last-child:after{
  content: none;
}

.u-table th.u-table__fixed-column,
.u-table td.u-table__fixed-column{
  left: 0;
  position: sticky;
  z-index: 2;
}

.u-table th.u-table__fixed-column{
  z-index: 3;
}

.u-table tr:hover td{
  background: var(--row-hover);
  border-bottom-color: var(--border-hover);
}

.u-table tr td:hover{
  background: var(--cell-hover);
}

.u-table_border {
  box-shadow: var(--box-shadow-default);
  border: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
  border-bottom: none;
}

.u-table-no-data {
  color: hsl(var(--hs-text), var(--l-text-disabled));
  font-size: 16px;
  padding: 16px;
  width: 100%;
}
</style>

<docs>
### Slots
You can override values as named slots.
In this case another columns will be shows as usual.
Slot scope will pass `value`, `row`, and `column`
Header cell also has format functions and scoped slots but it provides only `column` param.
To set scoped slot for header cell just add prefix `head_` to column ID

```vue
<template>
  <u-table
    :items="currencies"
    :columns="columns"
  >
    <template #head_code="{ column }">
      <el-input
        :value="column.label"
      />
    </template>

    <template #code="{ value, row }">
      <el-input
        :value="value"
        @input="changeCode({ ID: row.ID, value: $event })"
      />
    </template>
  </u-table>
</template>
<script>
  export default {
    data () {
      return {
        currencies: [{
          ID: 1,
          code: 'UAH',
          caption: 'Hryvna',
          country: 'Ukraine'
        },{
          ID: 2,
          code: 'USD',
          caption: 'Dollar',
          country: 'USA'
        },{
          ID: 3,
          code: 'EUR',
          caption: 'Euro',
          country: 'France'
        },{
          ID: 4,
          code: 'JPY',
          caption: 'Yen',
          country: 'Japan'
        },{
          ID: 5,
          code: 'PLN',
          caption: 'Zloty',
          country: 'Poland'
        }],
        columns: [{
          id: 'code',
          label: 'Code'
        }, {
          id: 'caption',
          label: 'Caption'
        }, {
          id: 'country',
          label: 'Country'
        }]
      }
    },

    methods: {
      changeCode ({ ID, value }) {
        const currency = this.currencies.find(c => c.ID === ID)

        currency.code = value
      }
    }
  }
</script>
```
</docs>
