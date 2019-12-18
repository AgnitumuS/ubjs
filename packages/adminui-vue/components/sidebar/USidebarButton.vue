<template>
  <el-tooltip
    :content="tooltip"
    :open-delay="300"
    :enterable="false"
    :disabled="!tooltip"
    :placement="tooltipPlacement"
  >
    <button
      v-bind="$attrs"
      class="u-sidebar__button"
      v-on="$listeners"
    >
      <i :class="icon" />
    </button>
  </el-tooltip>
</template>

<script>
export default {
  name: 'USidebarButton',
  props: {
    /**
     * Icon class is required
     */
    icon: {
      type: String,
      required: true
    },
    /**
     * Tooltip text
     */
    tooltip: String,
    /**
     * Tooltip placement
     */
    tooltipPlacement: {
      type: String,
      default: 'bottom'
    }
  }
}
</script>

<style>
  .u-sidebar__button {
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: 40px;
    color: rgb(var(--text-contrast), 0.7);
    background: rgb(var(--bg-hover));
    cursor: pointer;
    transition: background 0.1s;
  }
  .u-sidebar__button:hover {
    background: rgb(var(--secondary));
    color: rgb(var(--text-contrast));
  }
</style>
