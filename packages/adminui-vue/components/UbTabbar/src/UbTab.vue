<template>
  <el-tooltip
    :disabled="inTray || tabData.title && tabData.title.length < 18"
    placement="bottom"
  >
    <span
      slot="content"
      v-html="tabData.title"
    />
    <div
      :class="[inTray ? 'ub-tabbar__tab-tray' : 'ub-tabbar__tab']"
      @click="$emit('open', tabData, inTray)"
      @click.right="$emit('right-click', $event, tabData)"
    >
      <div
        class="ub-tabbar__tab__title"
        v-html="tabData.title"
      />
      <div
        class="ub-tabbar__tab__close"
        @click.stop="$emit('close', [tabData], inTray)"
      />
    </div>
  </el-tooltip>
</template>

<script>
module.exports = {
  name: 'UbTab',
  props: {
    tabData: Object,
    inTray: Boolean
  }
}
</script>

<style>
.ub-tabbar__tab{
  height: 32px;
  padding-left: 12px;
  padding-right: 28px;
  border-radius: 16px;
  background-color: #fdfdfd;
  border: solid 1px rgba(var(--dark-blue), 0.54);
  user-select:none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: rgba(var(--dark-blue), 0.87);
  position: relative;
  white-space:nowrap;
  margin-right: 8px;
  max-width: 170px;
}

.ub-tabbar__tab:last-child{
  margin-right: 0
}

.ub-tabbar__tab:hover{
  background-color: rgba(var(--green), 0.16);
  border-color: rgba(var(--dark-blue), 0.54);
}

.ub-tabbar__tab.active{
  background-color: rgba(var(--blue), 1);
  color: #fff;
  cursor: default;
}

.ub-tabbar__tab__title{
  text-overflow: ellipsis;
  overflow: hidden;
  padding: 8px 0;
}

.ub-tabbar__tab__close{
  cursor: pointer;
  position: absolute;
  height: 100%;
  width: 24px;
  top: 0px;
  right: 2px;
  display:flex;
  align-items: center;
  justify-content: center;
}

.ub-tabbar__tab__close:after{
  content: '✖';
  font-weight: 300;
  font-size: 11px;
}

.ub-tabbar__tab-tray{
  height: 32px;
  padding-right: 95px;
  padding-left: 40px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(252, 252, 249, 0.87);
  white-space:nowrap;
  position: relative;
  cursor: pointer;
  border-left: 4px solid transparent;
  transition: .1s;
  transition-property: background-color, border-color;
  max-width: 300px;
}

.ub-tabbar__tab-tray:hover,
.ub-tabbar__tab-tray.active{
  color: #ffffff;
}

.ub-tabbar__tab-tray.active{
  border-color: #fff;
  background-color: rgba(var(--dark-blue), 1);
}
.ub-tabbar__tab-tray:hover{
  border-color: rgba(var(--green), 1);
  background-color: rgba(var(--dark-blue), 1);
}
</style>
