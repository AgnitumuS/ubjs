<template>
  <el-tooltip 
    :disabled="tabData.title && tabData.title.length < 18" 
    :content="tabData.title" 
    placement="bottom"
    >
    <div
      :class="[inTray ? 'ub-tabbar__tab-tray' : 'ub-tabbar__tab']"
      @click="$emit('open', tabData, inTray)"
      @click.right="$emit('right-click', $event, tabData)"
      >
      <div class="ub-tabbar__tab__title">
        {{ tabData.title }}
      </div>
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
  props: [
    'tabData',
    'inTray'
  ]
}
</script>
