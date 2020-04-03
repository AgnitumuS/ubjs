<template>
  <el-tooltip
    :disabled="inTray || tabData.title && tabData.title.length < 18"
    :enterable="false"
    placement="bottom"
  >
    <span
      slot="content"
      v-html="tabData.title"
    />
    <div
      class="u-navbar__tab"
      @click="$emit('open', tabData, inTray)"
      @click.middle="$emit('close', [tabData], inTray)"
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
  .u-navbar__tab {
    height: 32px;
    padding-left: 12px;
    padding-right: 28px;
    border-radius: 16px;
    border: solid 1px hsl(var(--hs-border), var(--l-layout-border-default));
    user-select: none;
    cursor: pointer;
    font-size: 13px;
    color: hsl(var(--hs-text), var(--l-text-default));
    position: relative;
    white-space: nowrap;
    margin-right: 8px;
    max-width: 170px;
    letter-spacing: 0.3px;
  }

  .u-navbar__tab:last-child {
    margin-right: 0
  }

  .u-navbar__tab:hover {
    background-color: hsl(var(--hs-background), var(--l-background-default));
  }

  .u-navbar__tab.active {
    background-color: hsl(var(--hs-primary), var(--l-background-default));
    border-color: hsl(var(--hs-primary), var(--l-layout-border-default));
    color: hsl(var(--hs-primary), var(--l-text-default));
    cursor: default;
  }

  .u-navbar__tab__title {
    text-overflow: ellipsis;
    overflow: hidden;
    padding: 8px 0;
    line-height: 1;
  }

  .u-navbar__tab__close {
    cursor: pointer;
    position: absolute;
    height: 100%;
    width: 24px;
    top: 0;
    right: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .u-navbar__tab__close:after {
    content: '✖';
    font-weight: 300;
    font-size: 11px;
  }

  .u-navbar__tab-tray {
    height: 32px;
    padding-right: 95px;
    padding-left: 40px;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    position: relative;
    cursor: pointer;
    border-left: 4px solid transparent;
    transition: .1s;
    transition-property: background-color, border-color;
    max-width: 300px;
  }

  .u-navbar__tab-tray:hover,
  .u-navbar__tab-tray.active {
    color: hsl(var(--hs-text), var(--l-text-inverse))
  }

  .u-navbar__tab-tray.active {
    border-color: hsl(var(--hs-text), var(--l-text-inverse));
    background-color: hsl(var(--hs-background), var(--l-background-default));
  }

  .u-navbar__tab-tray:hover {
    border-color: hsl(var(--hs-primary), var(--l-layout-border-default));
    background-color: hsl(var(--hs-background), var(--l-background-active));
  }
</style>
