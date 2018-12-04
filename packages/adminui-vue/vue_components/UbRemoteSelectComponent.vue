<template>
  <el-select v-model="value" filterable reserve-keyword clearable>
    <el-option v-for="item in items" :key="item[primaryColumn]"
               :label="item[displayValue]" :value="item[primaryColumn]">
    </el-option>
  </el-select>
</template>

<script>
  module.exports = {
    name: 'UbRemoteSelectComponent',
    props: {
      value: {
        type: String
      },
      entityName: {
        type: String,
        required: true
      },
      customFilter: {
        type: Array,
        default() {
          return []
        }
      },
      primaryColumn: {
        type: String,
        default() {
          return "ID"
        }
      }
    },
    data () {
      return {
        items: [],
        itemCount: 10,
        endOfData: false,
        searchText: ''
      }
    },
    computed: {
      displayValue () {
        return $App.domainInfo.get(this.entityName).descriptionAttribute
      }
    },
    mounted () {
      var promise = UB.Repository(this.entityName).attrs(this.primaryColumn, this.displayValue).start(this.items.length || 0).limit(this.itemCount)
        .where(this.displayValue, 'contains', this.searchText);

      this.customFilter.forEach((item) => {
        promise = promise.attrs(item.column).where(item.column, item.condition, item.value)
      })

      promise.select()
        .then((data) => {this.items = this.items.concat(data)})
    }
  }
</script>