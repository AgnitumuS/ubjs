<template>
  <el-tooltip 
    :disabled="inTray || tabData.title && tabData.title.length < 18" 
    placement="bottom"
    >
    <span v-html="tabData.title" slot="content"></span>
    <div
      :class="[inTray ? 'ub-tabbar__tab-tray' : 'ub-tabbar__tab']"
      @click="$emit('open', tabData, inTray)"
      @click.right="$emit('right-click', $event, tabData)"
      >
      <div class="ub-tabbar__tab__title" v-html="tabData.title"></div>
      <div 
        class="ub-tabbar__tab__close" 
        @click.stop="$emit('close', [tabData], inTray)"
        ></div>
    </div>
</el-tooltip>
</template>

<script>
module.exports = {
  name: 'tab',
  props: {
    tabData: Object,
    inTray: Boolean
  }
}
</script>
