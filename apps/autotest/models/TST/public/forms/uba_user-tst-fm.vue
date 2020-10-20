<template>
  <uba-user-root>
    <div
      slot="attr_name"
      slot-scope="{value, originalComponent}"
    >
      add info before login field
      <component :is="originalComponent" />
      add info after login field
    </div>

    <div slot="additionalTabs">
      <el-tab-pane label="new tab">
        tab content
      </el-tab-pane>
    </div>
  </uba-user-root>
</template>

<script>
const parentForm = require('@unitybase/uba/public/forms/uba_user-fm.vue')
const Vue = require('vue')

module.exports.controller = (cfg) => {
  return parentForm.controller(cfg)

  // cfg.masterFieldList = ['addedAttr']
  // const parentController = parentForm.controller(cfg)
  // parentController.fieldList.push('addedAttr')
  // TODO: add collection
  // TODO: change validation rules
  // return parentController
}

module.exports.default = Vue.extend(parentForm.default)
</script>
