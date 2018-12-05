<template>
    <el-select ref="selector" v-model="resultData" filterable reserve-keyword clearable @change="$emit('input', resultData)">
        <template slot-scope="scope">
            <el-option v-for="item in items" :key="item[primaryColumn]"
                       :label="item[displayValue]" :value="item[primaryColumn]">
            </el-option>
            <el-row type="flex" justify="end" style="padding: 0px 20px" v-if="hasData">
                <el-button type="text" @click="loadNext">{{buttonMoreCaption}}</el-button>
            </el-row>
        </template>
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
        default () {
          return []
        }
      },
      primaryColumn: {
        type: String,
        default () {
          return 'ID'
        }
      }
    },
    methods: {
      loadByInput() {
        this.hasData = true
        this.items = []
        this.loadNext()
      },
      loadNext () {
        let itemsLength = this.items.length || 0
        let promise = UB.Repository(this.entityName).attrs(this.primaryColumn, this.displayValue).start(itemsLength).limit(this.itemCount)

        this.customFilter.forEach((item) => {
          promise = promise.attrs(item.column).where(item.column, item.condition, item.value)
        })

        // if (this.$refs.selector.query && this.$refs.selector.query === this.value) {
        //   promise = promise.where(this.displayValue, 'contains', this.$refs.selector.query)
        // }

        promise.select()
          .then((data) => {
            if (data.length > 0) this.items = this.items.concat(data)
            if (itemsLength + this.itemCount > this.items.length || data.length === 0) this.hasData = false
          })
      }
    },
    data () {
      return {
        resultData: this.value,
        items: [],
        itemCount: 20,
        hasData: true,
        buttonMoreCaption: UB.i18n('more')
      }
    },
    computed: {
      displayValue () {
        return $App.domainInfo.get(this.entityName).descriptionAttribute
      }
    },
    mounted () {
      this.loadNext()
    }
  }
</script>