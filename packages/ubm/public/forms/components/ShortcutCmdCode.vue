<template>
  <el-row
    type="flex"
    style="height: 100%"
  >
    <el-col :span="6">
      <div
        ref="snippet"
        class="ub-navshortcut__cmd-code__snippet"
      >
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
      <u-code-mirror
        ref="codeMirror"
        v-model="cmdCode"
        style="height: 100%"
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
    },

    availableEntities () {
      return Object.keys(this.$UB.connection.domain.entities)
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
      if (res && this.availableEntities.includes(res[1]) && res[1] !== '') {
        this.entityName = res[1]
      }
    },

    setSnippetHeight () {
      if (this.$refs.snippet && this.$refs.codeMirror) {
        const { offsetHeight } = this.$refs.codeMirror.$el
        const height = offsetHeight < 200 ? 200 : offsetHeight
        this.$refs.snippet.style.height = `${height}px`
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
