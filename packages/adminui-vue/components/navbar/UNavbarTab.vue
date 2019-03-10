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
      :class="[inTray ? 'u-navbar__tab-tray' : 'u-navbar__tab']"
      @click="$emit('open', tabData, inTray)"
      @click.right="$emit('right-click', $event, tabData)"
    >
      <div
        class="u-navbar__tab__title"
        v-html="tabData.title"
      />
      <div
        class="u-navbar__tab__close"
        @click.stop="$emit('close', [tabData], inTray)"
      />
    </div>
  </el-tooltip>
</template>

<script>
export default {
  name: 'UNavbarTab',
  props: {
    tabData: Object,
    inTray: Boolean
  }
}
</script>

<style>
.u-navbar__tab{
  height: 32px;
  padding-left: 12px;
  padding-right: 28px;
  border-radius: 16px;
  background-color: #fdfdfd;
  border: solid 1px rgba(var(--bg-dark), 0.54);
  user-select:none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: rgba(var(--bg-dark), 0.87);
  position: relative;
  white-space:nowrap;
  margin-right: 8px;
  max-width: 170px;
}

.u-navbar__tab:last-child{
  margin-right: 0
}

.u-navbar__tab:hover{
  background-color: rgba(var(--primary), 0.16);
  border-color: rgba(var(--bg-dark), 0.54);
}

.u-navbar__tab.active{
  background-color: rgba(var(--bg), 1);
  color: #fff;
  cursor: default;
}

.u-navbar__tab__title{
  text-overflow: ellipsis;
  overflow: hidden;
  padding: 8px 0;
}

.u-navbar__tab__close{
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

.u-navbar__tab__close:after{
  content: '✖';
  font-weight: 300;
  font-size: 11px;
}

.u-navbar__tab-tray{
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

.u-navbar__tab-tray:hover,
.u-navbar__tab-tray.active{
  color: #ffffff;
}

.u-navbar__tab-tray.active{
  border-color: #fff;
  background-color: rgba(var(--bg-dark), 1);
}
.u-navbar__tab-tray:hover{
  border-color: rgba(var(--primary), 1);
  background-color: rgba(var(--bg-dark), 1);
}
</style>
