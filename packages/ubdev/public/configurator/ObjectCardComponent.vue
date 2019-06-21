<template>
  <el-row type="flex">
    <el-col :span="15">
      <el-card shadow="hover">
        <el-form label-position="left" label-width="13%" ref="form">
          <el-form-item label="File Name: ">
            <el-input v-model="fileName" disabled/>
          </el-form-item>
          <div v-if="showMainProperties">
            <el-form-item label="Caption: ">
              <el-input v-model="metaObject.caption"/>
            </el-form-item>
            <el-form-item label="Sql Alias: ">
              <el-input v-model="metaObject.sqlAlias"/>
            </el-form-item>
            <el-form-item label="Desctiption: ">
              <el-input v-model="metaObject.description"/>
            </el-form-item>
          </div>
        </el-form>
        <el-row type="flex" justify="center">
          <el-button v-if="showMainProperties" style="border: 0" type="default" icon="el-icon-arrow-up"
                     v-on:click="showMainProperties = !showMainProperties"/>
          <el-button v-else style="border: 0ch" type="default" icon="el-icon-arrow-down"
                     v-on:click="showMainProperties = !showMainProperties"/>
        </el-row>
      </el-card>
      <!-- attributes -->
      <el-card style="margin-top:5px" shadow="hover">
        <el-input style="width:50%" v-model="newAttrName"></el-input>
        <el-button :disabled="!newAttrName" type="default" icon="el-icon-plus" style="margin-left: 5px"
                   @click="addAttribute"> Add Attribute
        </el-button>
        <el-table id="attrTable" ref="attrTable" empty-text="Nothing to show" :data="metaObject.attributes"
                  highlight-current-row @current-change="changeProps">
          <el-table-column label="Attribute" prop="name">
          </el-table-column>
          <el-table-column label="Caption" prop="caption" min-width="90">
          </el-table-column>
          <el-table-column label="Type" prop="dataType" :formatter="formatTypeCell">
          </el-table-column>
          <el-table-column label="Allow Null" prop="allowNull" align="center" width="85">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.allowNull"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="Operations" min-width="90">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="deleteRow(scope.$index)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>
    <el-col :span="9">
      <el-card style="margin-left:10px" shadow="hover">
        <h3>Properties</h3>
        <property-card :currentRow="currentRow" :schema="schema"/>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
const PropertyCard = require('./PropertyCardComponent.vue').default

module.exports.default = {
  name: 'ObjectCard',
  components: {
    PropertyCard
  },
  props: {
    metaObject: {
      type: Object,
      required: true
    },
    schema: {
      type: Object,
      required: true
    },
    fileName: String
  },
  data () {
    return {
      showMainProperties: false,
      newAttrName: '',
      currentRow: {}
    }
  },
  methods: {
    addAttribute () {
      if (this.newAttrName) {
        var obj = {
          name: this.newAttrName
        }
        this.metaObject.attributes.push(obj)
        this.$refs.attrTable.setCurrentRow(obj)
        this.newAttrName = ''
      }
    },
    changeProps (row) {
      this.currentRow = row
    },
    deleteRow (index) {
      this.$confirm('Are you sure to delete this property?', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel'
      }).then(_ => {
        var key = Object.keys(this.metaObject.attributes)[index]
        this.$delete(this.metaObject.attributes, key)
      }).catch(_ => {})
    },
    formatTypeCell (row) {
      var result = row.dataType
      if (row.dataType === 'String') result = `${row.dataType} (${row.size})`
      if (row.dataType === 'Entity') result = `${row.dataType} → ${row.associatedEntity}`
      return result
    }
  },
  mounted () {
    if (this.metaObject.attributes) {
      this.$refs.attrTable.setCurrentRow(this.metaObject.attributes[0])
    }
  }
}
</script>
