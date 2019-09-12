<template>
  <el-table :data="rows">
    <el-table-column
      v-for="col in columns"
      :key="col.code"
      :label="col.label"
      :prop="col.code"
    >
      <template slot-scope="{row}">
        <template v-if="row.data[col.code] instanceof Date">
          {{ $moment(row.data[col.code]).format('DD.MM.YYYY') }}
        </template>
        <template v-else>
          {{ row.data[col.code] }}
        </template>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'UDetailGrid',
  props: {
    /**
       * Name of key what you set in collectionRequests object
       */
    collectionName: {
      type: String,
      required: true
    },

    /**
       * array of objects with code and label
       */
    columns: {
      type: Array,
      required: true,
      validator (arr) {
        return arr.every(col => {
          return Object.keys(col).includes('label') && Object.keys(col).includes('code')
        })
      }
    }
  },

  computed: {
    rows () {
      return this.$store.state.collections[this.collectionName].items
    }
  }
}
</script>
