<template>
  <div>
    <el-row type="flex" justify="start">
      <div style="margin-right: 5px" v-for="(mixin, name) in mixins" :key="mixin.name">
        <el-button :type="name == currentMixinName ? 'primary':'default'" @click="showMixinData(name)">{{name}}</el-button>
      </div>
      <el-popover placement="right" width="500" trigger="click" v-if="moreMixins.length > 0" v-model="popoverAddMixinVisible">
        <el-table :data="moreMixins" @row-click="addMixin" :show-header="false">
          <el-table-column property="name" width="100"></el-table-column>
          <el-table-column property="description" width="400"></el-table-column>
        </el-table>
        <el-button type="success" icon="el-icon-plus" slot="reference" />
      </el-popover>
    </el-row>
    <el-row style="margin-top:10px">
      <el-col :xl="10" :lg="16">
        <el-card v-if="currentMixinInfo" shadow="never">
          <el-table :data="includedProperties" :show-header="false" empty-text="No properties" highlight-current-row>
            <el-table-column property="name" width="150" />
            <el-table-column>
              <template slot-scope="scope">
                <el-tooltip v-if="scope.store.states.currentRow == scope.row" class="item" effect="dark" placement="bottom"
                  :disabled="true" :content="scope.row.description">
                  <el-checkbox v-if="scope.row.type == 'boolean'" v-model.lazy="currentMixin[scope.row.name]" />
                  <el-select v-else-if="scope.row.enum" v-model="currentMixin[scope.row.name]" placeholder="Select"
                    no-match-text="No match text" no-data-text="No data">
                    <el-option v-for="item in scope.row.enum" :key="item" :label="item" :value="item" />
                  </el-select>
                  <el-select v-else-if="scope.row.type == 'array'" v-model="currentMixin[scope.row.name]" multiple
                    no-match-text="No match text" no-data-text="No data" filterable allow-create default-first-option
                    placeholder="Add Items">
                    <el-option v-for="item in currentMixin[scope.row.name]" :key="item" :label="item" :value="item" />
                  </el-select>
                  <objectControl v-else-if="scope.row.type == 'object'" :row="currentMixin" :propName="scope.row.name" />
                  <input v-else class="el-input__inner" placeholder="Please input" :type="scope.row.type == 'number' ? 'number' : 'text'"
                    v-model.lazy="currentMixin[scope.row.name]" />
                </el-tooltip>
                <div v-else>{{currentMixin[scope.row.name]}}</div>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="Operations" width="100">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="deleteProperty(scope.row)">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-popover placement="bottom" width="700" trigger="click" v-model="popoverAddPropVisible" v-if="otherProperties.length > 0">
            <el-table :data="otherProperties" @row-click="addProperty" :show-header="false">
              <el-table-column property="name" width="150"></el-table-column>
              <el-table-column property="description" width="550"></el-table-column>
            </el-table>
            <el-button style="margin-top: 10px" type="success" icon="el-icon-plus" slot="reference">Add Property</el-button>
          </el-popover>
          <el-button style="margin: 10px 0 0 5px" @click="deleteMixin" type="danger" icon="el-icon-delete">Remove
            Mixin</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  const objectControl = require("./ObjectControl.vue");

  module.exports = {
    props: {
      mixins: {
        type: Object,
        required: true
      },
      schema: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        popoverAddMixinVisible: false,
        popoverAddPropVisible: false,
        currentMixin: null,
        currentMixinName: null
      }
    },
    methods: {
      showMixinData(name) {
        this.currentMixin = this.mixins[name];
        this.currentMixinName = name;
        this.popoverAddPropVisible = false;
        this.popoverAddMixinVisible = false;
      },
      addMixin(mixin) {
        this.$set(this.mixins, mixin.name, {})
        this.currentMixin = {};
        this.showMixinData(mixin.name);
      },
      addProperty(property) {
        var value = "";
        if (property.type === 'boolean') value = false;
        if (property.type === 'array') value = [];
        if (property.type === 'object') value = {};
        this.$set(this.currentMixin, property.name, value);
        this.popoverAddPropVisible = false;
      },
      deleteMixin() {
        this.$delete(this.mixins, this.currentMixinName);
        this.currentMixin = null;
        this.currentMixinName = null;
        this.setFirstMixinEdit();
      },
      deleteProperty(row) {
        if (row.name) this.$delete(this.currentMixin, row.name);
      },
      setFirstMixinEdit() {
        var keys = Object.keys(this.mixins);
        if (keys.length > 0) this.showMixinData(keys[0])
      }
    },
    mounted() {
      this.setFirstMixinEdit();
    },
    computed: {
      schemaArray() {
        return Object.keys(this.schema).map(function (key) {
          return {
            name: key,
            fields: this.schema[key].properties,
            description: this.schema[key].description
          }
        }, this);
      },
      moreMixins() {
        return this.schemaArray.filter((item) => {
          return !Object.keys(this.mixins).includes(item.name)
        });
      },
      currentMixinInfo() {
        return this.schemaArray.filter(item => {
          return item.name === this.currentMixinName
        }, this)[0];
      },
      includedProperties() {
        return Object.keys(this.currentMixinInfo.fields)
          .filter((name) => {
            return Object.keys(this.currentMixin).includes(name)
          }, this)
          .map((name) => {
            return {
              name,
              ...this.currentMixinInfo.fields[name]
            }
          });
      },
      otherProperties() {
        return Object.keys(this.currentMixinInfo.fields)
          .filter((name) => {
            return !Object.keys(this.currentMixin).includes(name)
          }, this)
          .map((name) => {
            return {
              name,
              ...this.currentMixinInfo.fields[name]
            }
          });
      }
    },
    components: {
      objectControl
    }
  }
</script>