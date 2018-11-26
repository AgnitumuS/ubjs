<template>
  <el-tabs type="border-card">
    <el-tab-pane label="Entity">
      <objCardComponent :metaObject="metaObject" :fileName="fileName" :schema="schemaObject.properties.attributes.items.properties" />
    </el-tab-pane>
    <el-tab-pane label="Mixins">
      <mixinsCardComponent :mixins="metaObject.mixins" :schema="schemaObject.properties.mixins.properties" />
    </el-tab-pane>
    <el-tab-pane label="Source">
      <el-input autosize type="textarea" spellcheck="false" v-model="outputJson"></el-input>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
  const objCardComponent = require("./ObjectCardComponent.vue");
  const mixinsCardComponent = require("./MixinsCardComponent.vue");

  module.exports = {
    props: {
      jsonObject: {
        type: [String, Object],
        required: true
      },
      fileName: String,
      schema: {
        type: [String, Object],
        required: true
      }
    },
    data() {
      return {
        metaObject: {},
        schemaObject: {}
      }
    },
    computed: {
      outputJson: {
        get: function () {
          return JSON.stringify(this.metaObject, (key, value) => {
            if (value !== "" && value !== null && value !== undefined && Object.keys(value).length !== 0) return value;
          }, 2);
        },
        set: function (newValue) {
          this.initMetaObject(newValue);
        }

      }
    },
    created() {
      if (this.jsonObject) {
        this.initMetaObject(this.jsonObject);
      }
      this.schemaObject = typeof this.schema === "string" ? JSON.parse(this.schema) : this.schema;
    },
    methods: {
      initMetaObject(json) {
        this.metaObject = typeof json === "string" ? JSON.parse(json) : json;
        if (this.metaObject) {
          if (!Array.isArray(this.metaObject.attributes)) {
            for (var propertyName in this.metaObject.attributes) {
              if (!this.metaObject.attributes[propertyName]["name"])
                this.$set(this.metaObject.attributes[propertyName], "name", propertyName);
            }
            this.$set(this.metaObject, "attributes", Object.values(this.metaObject.attributes));
          }
        }
      }
    },
    components: {
      objCardComponent,
      mixinsCardComponent
    }
  }
</script>