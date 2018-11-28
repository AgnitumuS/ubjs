<template>
  <el-tabs type="border-card" v-if="metaObject && schemaObject" @tab-click="reloadCodeMirrorData">
    <el-tab-pane label="Entity">
      <objCardComponent :metaObject="metaObject" :fileName="fileName" :schema="schemeAttributes"></objCardComponent>
    </el-tab-pane>
    <el-tab-pane label="Mixins">
      <mixinsCardComponent :mixins="metaObject.mixins" :schema="schemaObject.properties.mixins.properties"></mixinsCardComponent>
    </el-tab-pane>
    <el-tab-pane id="sourceTab" label="Source">
      <el-input :id="_uid" type="textarea" v-model="outputJson"></el-input>
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
      schemeAttributes() {
        return this.schemaObject.properties.attributes.items.properties
      },
      outputJson: {
        get: function () {
          if (this.metaObject) {
            let minObj = {...this.metaObject}
            minObj.attributes.forEach((attribute) => {
              Object.keys(attribute).forEach((key) => {
                let schemeAttr = this.schemeAttributes[key];
                if (!schemeAttr) this.$delete(attribute, key)
                if (schemeAttr && schemeAttr.default && attribute[key] === schemeAttr.default) {
                  this.$delete(attribute, key)
                }
              }, this)
            }, this)
            return JSON.stringify(minObj, this.jsonReplacer, 2)
          }
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
    methods: {
      initCodeMirror() {
        if (!this.codeMirror) {
          System.import('@unitybase/codemirror-full').then((CodeMirror) => {
            var el = document.getElementById(this._uid)
            if (el) {
              this.codeMirror = CodeMirror.fromTextArea(el, {
                mode: 'javascript',
                lineNumbers: true,
                lint: Object.assign({asi: true, esversion: 6}, $App.connection.appConfig.uiSettings.adminUI.linter),
                readOnly: false,
                tabSize: 2,
                highlightSelectionMatches: {annotateScrollbar: true},
                matchBrackets: true,
                autofocus: true,
                foldGutter: true,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
                extraKeys: {
                  'Ctrl-Space': 'autocomplete'
                }
              })
              this.codeMirror.on('change', function (cmInstance) {
                if (this.outputJson !== cmInstance.getValue()) this.outputJson = cmInstance.getValue()
                this.refreshCodeMirror()
              }.bind(this))
              this.refreshCodeMirror()
            }
          }, this)
        }
      },
      jsonReplacer(key, value) {
        if (
          (value !== "" && value !== null && value !== undefined && typeof value !== "object") ||
          (typeof value === "object" && Object.keys(value).length !== 0)
        ) return value;
      },
      refreshCodeMirror() {
        setTimeout(function() {
          this.codeMirror.refresh()
        }.bind(this),1)
      },
      reloadCodeMirrorData() {
        if (arguments[0].$attrs.id === 'sourceTab') {
          this.initCodeMirror()
          if (this.codeMirror) {
            if (this.codeMirror.doc.getValue() !== this.outputJson) this.codeMirror.doc.setValue(this.outputJson)
          }
        }
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