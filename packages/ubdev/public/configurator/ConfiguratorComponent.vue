<template>
  <el-tabs
    v-if="metaObject && schemaObject"
    type="border-card"
    @tab-click="reloadCodeMirrorData"
  >
    <el-tab-pane label="Entity">
      <objCardComponent
        :meta-object="metaObject"
        :file-name="fileName"
        :schema="schemeAttributes"
      />
    </el-tab-pane>
    <el-tab-pane label="Mixins">
      <mixinsCardComponent
        :mixins="metaObject.mixins"
        :schema="schemaObject.properties.mixins.properties"
      />
    </el-tab-pane>
    <el-tab-pane
      id="sourceTab"
      label="Source"
    >
      <el-input
        :id="_uid"
        v-model="outputJson"
        type="textarea"
      />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
const objCardComponent = require('./ObjectCardComponent.vue')
const mixinsCardComponent = require('./MixinsCardComponent.vue')
const {UBDomain} = require('@unitybase/cs-shared')

module.exports = {
  props: {
    fileName: {
      type: [String],
      required: true
    }
  },
  data () {
    return {
      metaObject: null,
      schemaObject: null,
      codeMirror: null
    }
  },
  computed: {
    schemeAttributes () {
      return this.schemaObject.properties.attributes.items.properties
    },
    outputJson: {
      get: function () {
        if (!this.metaObject) return
        let e = new UBDomain.UBEntity(this.metaObject)
        return JSON.stringify(e.asJSON(), null, '  ')
        // let minObj = { ...this.metaObject }
        // minObj.attributes.forEach((attribute) => {
        //   Object.keys(attribute).forEach((key) => {
        //     let schemeAttr = this.schemeAttributes[key]
        //     if (!schemeAttr) this.$delete(attribute, key)
        //     if (schemeAttr && schemeAttr.default && attribute[key] === schemeAttr.default) {
        //       this.$delete(attribute, key)
        //     }
        //   }, this)
        // }, this)
        // return JSON.stringify(minObj, this.jsonReplacer, 2)
      },
      set: function (newValue) {
        this.initMetaObject(newValue)
      }
    }
  },
  created () {
    if (this.fileName) {
      let entity = $App.domainInfo.get(this.fileName)
      if (entity) this.initMetaObject(entity)
    }
    UB.get('models/UB/schemas/entity.schema.json').then((response) => {
      this.schemaObject = response.data
    })
  },
  methods: {
    initCodeMirror () {
      if (this.codeMirror) return
      System.import('@unitybase/codemirror-full').then((CodeMirror) => {
        var el = document.getElementById(this._uid)
        if (!el) return
        this.codeMirror = CodeMirror.fromTextArea(el, {
          mode: 'javascript',
          lineNumbers: true,
          lint: Object.assign({ asi: true, esversion: 6 }, $App.connection.appConfig.uiSettings.adminUI.linter),
          readOnly: false,
          tabSize: 2,
          highlightSelectionMatches: { annotateScrollbar: true },
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
      })
    },
    jsonReplacer (key, value) {
      if (
        (value !== '' && value !== null && value !== undefined && typeof value !== 'object') ||
        (typeof value === 'object' && Object.keys(value).length !== 0)
      ) return value
    },
    refreshCodeMirror () {
      setTimeout(function () {
        this.codeMirror.refresh()
      }.bind(this), 1)
    },
    reloadCodeMirrorData () {
      if (arguments[0].$attrs.id === 'sourceTab') {
        this.initCodeMirror()
        if (this.codeMirror) {
          if (this.codeMirror.doc.getValue() !== this.outputJson) this.codeMirror.doc.setValue(this.outputJson)
        }
      }
    },
    initMetaObject (json) {
      let valid = true
      try {
        this.metaObject = typeof json === 'string' ? JSON.parse(json) : { ...json }
      } catch (e) {
        valid = false
      }
      if (valid && this.metaObject) {
        if (!Array.isArray(this.metaObject.attributes)) {
          Object.keys(this.metaObject.attributes).forEach((propertyName) => {
            if (!this.metaObject.attributes[propertyName]['name']) { this.$set(this.metaObject.attributes[propertyName], 'name', propertyName) }
          })
          this.$set(this.metaObject, 'attributes', Object.values(this.metaObject.attributes))
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
