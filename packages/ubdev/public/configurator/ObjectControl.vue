<template>
  <div>
    <table class="object-control__table">
      <tr v-for="item in Object.keys(currentObj).map((key) => { return { name: key, value: currentObj[key] } })"
          :key="item.name"
          class="object-control__row">
        <td class="object-control__cell" style="width:35%">{{item.name}}:</td>
        <td style="width:55%">
          <el-input placeholder="Value" v-model="currentObj[item.name]" size="small"/>
        </td>
        <td style="width:10%">
          <el-button type="danger" size="small" icon="el-icon-delete" slot="reference" @click="removeProperty(name)"/>
        </td>
      </tr>
      <tr>
        <td style="width:35%">
          <el-input size="small" v-model="currentKey" placeholder="Key" style="width:100%"/>
        </td>
        <td style="width:55%">
          <el-input size="small" v-model="currentValue" placeholder="Value"/>
        </td>
        <td style="width:10%">
          <el-button type="success" size="small" icon="el-icon-check" slot="reference" @click="addProperty"/>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
  module.exports = {
    props: {
      row: {
        type: Object,
        required: true
      },
      propName: String
    },
    data () {
      return {
        currentKey: null,
        currentValue: null
      }
    },
    methods: {
      removeProperty (key) {
        this.$delete(this.currentObj, key)
      },
      addProperty () {
        if (this.currentKey) {
          this.$set(this.currentObj, this.currentKey, this.currentValue)
          this.currentKey = null
          this.currentValue = null
        }
      }
    },
    computed: {
      currentObj () {
        if (typeof this.row[this.propName] !== 'object') {
          this.$emit('setPropValue', this.propName, {})
          this.$forceUpdate()
        }
        return this.row[this.propName]
      }
    }
  }
</script>

<style>
  .object-control__cell {
    text-align: right !important;
    padding-right: 2% !important;
  }

  .object-control__row {
    margin-bottom: 5px;
  }

  .object-control__row :last-child {
    margin-bottom: 0px;
  }

  .object-control__table {
    background-color: white;
    padding: 5px;
  }
</style>