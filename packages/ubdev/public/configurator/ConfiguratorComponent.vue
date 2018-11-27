<template>
  <el-tabs type="border-card" v-if="schemaObject && metaObject" @tab-click="reloadCodeMirrorData">
    <el-tab-pane label="Entity">
      <objCardComponent :metaObject="metaObject" :fileName="fileName" :schema="schemaObject.properties.attributes.items.properties" />
    </el-tab-pane>
    <el-tab-pane label="Mixins">
      <mixinsCardComponent :mixins="metaObject.mixins" :schema="schemaObject.properties.mixins.properties" />
    </el-tab-pane>
    <el-tab-pane id="sourceTab" label="Source">
      <el-input id="vue-configurator-sources" autosize type="textarea" spellcheck="false" v-model="outputJson"></el-input>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
  const objCardComponent = require("./ObjectCardComponent.vue");
  const mixinsCardComponent = require("./MixinsCardComponent.vue");

  module.exports = {
    props: {
      fileName: {
        type: [String],
        required: true
      }
    },
    data() {
      return {
        metaObject: null,
        schemaObject: null,
        codeMirror: null
      }
    },
    computed: {
      outputJson: {
        get: function () {
          return JSON.stringify(this.metaObject, (key, value) => {
            if (
              (value !== "" && value !== null && value !== undefined && typeof value !== "object") ||
              (typeof value === "object" && Object.keys(value).length !== 0)
            ) return value;
          }, 2);
        },
        set: function (newValue) {
          this.initMetaObject(newValue);
        }
      }
    },
    created() {
      if (this.fileName) {
        let entity = $App.domainInfo.get(this.fileName);
        if (entity) this.initMetaObject(entity);
      }
      UB.get("models/UB/schemas/entity.schema.json").then((response) => {
        this.schemaObject = response.data;
      })
    },
    mounted() {
      System.import('@unitybase/codemirror-full').then((CodeMirror) => {
        var el = document.getElementById("vue-configurator-sources")
        this.codeMirror = CodeMirror.fromTextArea(el, {
          mode: {name: "javascript", json: true},
          lineNumbers: true,
          lint: Object.assign({asi: true, esversion: 6}, $App.connection.appConfig.uiSettings.adminUI.linter),
          readOnly: false,
          tabSize: 2,
          highlightSelectionMatches: {annotateScrollbar: true},
          matchBrackets: true,
          foldGutter: true,
          gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
          extraKeys: {
            'Ctrl-Space': 'autocomplete'
          }
        }, this)
        this.codeMirror.on('change', function (cmInstance) {
          if (this.outputJson !== cmInstance.getValue()) this.initMetaObject(cmInstance.getValue())
        }.bind(this));
      }, this)
    },
    methods: {
      reloadCodeMirrorData() {
        if (arguments[0].$attrs.id === 'sourceTab') this.codeMirror.doc.setValue(this.outputJson);
      },
      initMetaObject(json) {
        this.metaObject = typeof json === "string" ? JSON.parse(json) : {...json};
        if (this.metaObject) {
          if (!Array.isArray(this.metaObject.attributes)) {
            Object.keys(this.metaObject.attributes).forEach((propertyName) => {
              if (!this.metaObject.attributes[propertyName]["name"])
                this.$set(this.metaObject.attributes[propertyName], "name", propertyName);
            });
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