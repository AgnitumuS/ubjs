<template>
    <el-select v-model="resultData" filterable reserve-keyword clearable @change="$emit('input', resultData)" style="width: 100%">
        <template slot-scope="scope">
            <el-option v-for="item in items" :key="item[primaryColumn]"
                       :label="item[displayValue]" :value="item[primaryColumn]">
            </el-option>
        </template>
    </el-select>
</template>

<script>
  module.exports = {
    name: 'UbEnumSelectComponent',
    props: {
      value: {
        type: String
      },
      eGroup: {
        type: String
      },
      primaryColumn: {
        type: String,
        default () {
          return 'code'
        }
      }
    },
    data () {
      return {
        resultData: this.value,
        items: [],
        entityName: 'ubm_enum'
      }
    },
    computed: {
      displayValue () {
        return $App.domainInfo.get(this.entityName).descriptionAttribute
      }
    },
    mounted () {
      let promise = UB.Repository(this.entityName)
        .attrs(this.primaryColumn, this.displayValue, 'eGroup')

      if (this.eGroup) promise = promise.where('eGroup', '=', this.eGroup)

      promise.select().then((data) => {
        this.items = this.items.concat(data)
      })
    }
  }
</script>