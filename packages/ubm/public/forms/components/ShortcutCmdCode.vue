<template>
  <el-row
    type="flex"
    style="height: 100%"
  >
    <el-col :span="6">
      <div
        ref="snippet"
        class="ub-navshortcut__cmd-code__snippet"
        tabindex="-1"
      >
        <h2> {{$ut('Attributes')}}</h2>
        <el-tree
          ref="tree"
          :data="cmdCodeAttrs"
          :expand-on-click-node="false"
          :props="{
            label: 'text'
          }"
          @node-click="selectNode"
        >
          <div slot-scope="{ node }">
            <span v-html="node.label" />
          </div>
        </el-tree>
      </div>
    </el-col>
    <el-col
      :span="18"
      style="height: 100%"
    >
      <h2> {{$ut('ubm_navshortcut.cmdCode')}}</h2>
      <u-code-mirror
        ref="codeMirror"
        v-model="cmdCode"
        style="height: 100%"
        :hintsFunction="doOnShowHints"
        @loaded="setSnippetHeight"
      />
    </el-col>
  </el-row>
</template>

<script>
const { mapInstanceFields } = require('@unitybase/adminui-vue')
const entityRe = /"entity"\s*:\s*"(\w*)"/

export default {
  name: 'ShortcutCmdCodeSnippet',

  data () {
    return {
      entityName: ''
    }
  },

  computed: {
    ...mapInstanceFields(['cmdCode']),

    cmdCodeAttrs () {
      if (this.entityName) {
        return this.$UB.core.UBUtil.getEntityAttributesTreeData(this.entityName, '', 1)
      } else {
        return []
      }
    }
  },

  watch: {
    cmdCode: {
      immediate: true,
      handler () {
        this.getEntityName()
        this.setSnippetHeight()
      }
    }
  },

  methods: {
    selectNode (node) {
      this.$refs.codeMirror._codeMirror.replaceSelection(`"${node.id}"`)
      this.$refs.codeMirror._codeMirror.getInputField().focus()
    },

    getEntityName () {
      const res = entityRe.exec(this.cmdCode)
      if (res && res[1] && this.$UB.connection.domain.has(res[1])) {
        this.entityName = res[1]
      }
    },

    setSnippetHeight () {
      if (this.$refs.snippet && this.$refs.codeMirror) {
        const { offsetHeight } = this.$refs.codeMirror.$el
        const height = offsetHeight < 200 ? 200 : offsetHeight
        this.$refs.snippet.style.height = `${height}px`
      }
    },

    doOnShowHints (cm) {
      return {
        list: [{
          displayText: 'showList',
          text: JSON.stringify({
            'cmdType': 'showList',
            'cmdData': {
              'params': [{
                'entity': 'TYPE-ENTITY-CODE',
                'method': 'select',
                'fieldList': ['Dbl-CLICK on left prop panel to add attribute']
              }]
            }
          }, null, '  ')
        }, {
          displayText: 'showForm',
          text: JSON.stringify({
            'cmdType': 'showForm',
            'formCode': 'TYPE HERE A FORM CODE FROM UBM_FORM or remove this line to use a default form for entity',
            'entity': 'TYPE HERE A ENTITY CODE',
            'instanceID': 'REPLACE IT by ID value (to edit element) or remove this line'
          }, null, '  ')
        }, {
          displayText: 'showReport',
          text: JSON.stringify({
            cmdType: 'showReport',
            description: 'OPTIONAL report form caption',
            cmdData: {
              reportCode: 'type here report code',
              reportType: 'html or pdf',
              reportParams: { // if passed report viewer will skip showing parameters enter form to user
                paramName: 'param value'
              }
            }
          }, null, '  ')
        }],
        from: cm.getCursor(), // this._codeMirror
        to: cm.getCursor()
      }
    }
  }
}
</script>

<style>
.ub-navshortcut__cmd-code__snippet{
  overflow: auto;
  max-height: 100%;
}
</style>
