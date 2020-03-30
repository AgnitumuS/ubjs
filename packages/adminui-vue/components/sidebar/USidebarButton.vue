<template>
  <el-tooltip
    :content="tooltip"
    :disabled="!tooltip"
    :enterable="false"
    :open-delay="300"
    :placement="tooltipPlacement"
  >
    <button
      class="u-sidebar__button"
      v-bind="$attrs"
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
    color: hsl(var(--hs-text), var(--l-text-inverse));
    background: hsl(var(--hs-sidebar), var(--l-sidebar-depth-1));
    cursor: pointer;
    transition: background 0.1s;
  }

  .u-sidebar__button:hover {
    background: hsl(var(--hs-sidebar), var(--l-sidebar-depth-2));
  }
</style>
