<template>
  <div>
    <h4>
      Snippet for entity "{{ entityName }}"
    </h4>

    <div class="ub-navshortcut__code-snippet">
      <el-tree
        ref="tree"
        :data="cmdCodeAttrs"
        :expand-on-click-node="false"
        :props="{
          label: 'text'
        }"
        @node-click="selectNode"
      >
        <div
          slot-scope="{ node }"
          @dblclick="clickNode(node)"
        >
          <span v-html="node.label" />
        </div>
      </el-tree>
    </div>
  </div>
</template>

<script>
const { mapInstanceFields } = require('@unitybase/adminui-vue')
const entityRe = /"entity"\s*:\s*"(\w*)"/

export default {
  name: 'ShortcutCmdCodeSnippet',

  data () {
    return {
      prevEntityName: ''
    }
  },

  computed: {
    ...mapInstanceFields(['cmdCode']),

    entityName () {
      const res = entityRe.exec(this.cmdCode)
      if (res && this.availableEntities.includes(res[1]) && res[1] !== '') {
        this.prevEntityName = res[1]
        return res[1]
      } else {
        return this.prevEntityName
      }
    },

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

  methods: {
    selectNode (node) {
      // console.log(node)
    },

    clickNode (e) {
      console.log(e)
    }
  }
}
</script>

<style>
.ub-navshortcut__code-snippet {
  max-height: 200px;
  overflow: auto;
}
</style>
