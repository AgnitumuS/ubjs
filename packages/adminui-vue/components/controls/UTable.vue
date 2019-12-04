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
            {
              'u-table__fixed-column': col.id === fixedColumnId,
              sortable: col.sortable
            },
            getAlignClass(col.headerAlign),
            getColumnClass(col)
          ]"
          :style="{
            maxWidth: col.maxWidth && col.maxWidth + 'px',
            minWidth: col.minWidth && col.minWidth + 'px',
            width: col.width && col.width + 'px'
          }"
          @click="changeSort(col.id)"
        >
          {{ $ut(col.label) }}
          <i
            v-if="col.sortable"
            class="u-table__head-cell__icon-sort"
            :class="getSortIcon(col.id)"
          />
        </th>
      </tr>
      <tr
        v-for="row in items"
        :key="row.ID"
        :class="getRowClass(row)"
        @dblclick="$emit('dblclick-row', {row})"
        @click="$emit('click-row', {row})"
        @contextmenu="$emit('contextmenu', $event, row)"
      >
        <td
          v-for="col in columns"
          :key="col.id"
          :class="[
            {
              'u-table__fixed-column': col.id === fixedColumnId,
            },
            getAlignClass(col.align),
            getColumnClass(col)
          ]"
          @click="$emit('click-cell', {row, column: col})"
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
    </table>
  </div>
</template>

<script>
const { formatValueMixin } = require('../UTableEntity/helpers')

export default {
  name: 'UTable',

  mixins: [formatValueMixin],

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
     */
    getColumnClass: {
      type: Function,
      default () {
        return ''
      }
    },

    /**
     * Function that returns custom class names for a row assigning class names for every row
     */
    getRowClass: {
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

  data () {
    return {
      sort: null
    }
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
    }
  },

  methods: {
    changeSort (id) {
      if (this.sort) {
        if (this.sort.column === id) {
          if (this.sort.order === 'asc') {
            this.sort.order = 'desc'
          } else {
            this.sort = null
          }
        } else {
          this.sort.column = id
          this.sort.order = 'asc'
        }
      } else {
        this.sort = {
          column: id,
          order: 'asc'
        }
      }

      this.$emit('sort', this.sort)
    },

    getSortIcon (id) {
      if (this.sort && this.sort.column === id) {
        return this.sort.order === 'asc' ? 'el-icon-caret-top' : 'el-icon-caret-bottom'
      } else {
        return 'el-icon-d-caret'
      }
    },

    getAlignClass (align = 'left') {
      return `u-table__cell__align-${align}`
    }
  }
}
</script>

<style>
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
  border-bottom: 1px solid rgb(var(--table-border));
  background: rgb(var(--table-bg));
  color: rgb(var(--table-text));
  padding: 16px;
  font-size: 14px;
  font-weight: 600;
  position: relative;
}

.u-table__cell-container{
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.u-table th {
  top: 0;
  z-index: 1;
  position: sticky;
  color: rgb(var(--table-header-color));
  white-space: nowrap;
}

.u-table th:after{
  content: '';
  width: 1px;
  height: 28px;
  position: absolute;
  top: calc(50% - 14px);
  right: 0;
  background: rgb(var(--table-border));
}

.u-table th:last-child:after,
.u-table th.u-table__fixed-column:after{
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
  background: rgb(var(--table-border));
  border-bottom-color: rgb(var(--table-border-hover));
}

.u-table tr td:hover{
  background: rgb(var(--table-cell-hover));
}

.u-table th.sortable{
  cursor: pointer;
}

.u-table__head-cell__icon-sort{
  font-size: 13px;
  margin-left: 2px;
  color: rgba(var(--info), 0.7);
}
</style>

<docs>
### Sortable
When `sortable` for a column is enabled, the sort icon will appear in the column header.
After clicking on this column, the sort change event will fire,
an object with the sort order and columnId is passed to it

```vue
  <template>
    <u-table
      :items="currencies"
      :columns="columns"
      @sort="onSortChanged"
    />
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
            label: 'Caption',
            sortable: true
          }, {
            id: 'country',
            label: 'Country'
          }]
        }
      },

      methods: {
        onSortChanged (sort) {
          console.log(sort)
        }
      }
    }
  </script>
```

### Slots
You can override values as named slots.
In this case another columns will be shows as usual.
Slot scope will pass `value`, `row`, and `column`

```vue
<template>
  <u-table
    :items="currencies"
    :columns="columns"
  >
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
