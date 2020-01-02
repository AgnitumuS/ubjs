<template>
  <el-tooltip
    :content="$ut(tooltip)"
    placement="bottom"
    :open-delay="300"
    :enterable="false"
    :disabled="!tooltip"
  >
    <button
      class="ub-toolbar__button"
      :class="color"
      type="button"
      v-bind="$attrs"
      :disabled="disabled"
      v-on="$listeners"
    >
      <i :class="icon" />
      <slot />
    </button>
  </el-tooltip>
</template>

<script>
export default {
  name: 'UToolbarButton',

  props: {
    /**
     * Icon class
     */
    icon: String,
    /**
     * Tooltip text
     */
    tooltip: String,
    /**
     * Icon and text color.
     * enum = primary | secondary | info | danger | warning
     */
    color: {
      type: String,
      default: 'primary'
    },
    /**
     * Weather disabled state
     */
    disabled: Boolean
  }
}
</script>

<style>
  .ub-toolbar__button{
    background: none;
    border: none;
    padding: 0 8px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: transform 0.1s;
    height: 100%;
  }

  .ub-toolbar__button:disabled{
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ub-toolbar__button:hover{
    opacity: 0.7;
  }

  .ub-toolbar__button.primary {
    color: rgb(var(--primary));
  }

  .ub-toolbar__button.secondary {
    color: rgb(var(--secondary));
  }

  .ub-toolbar__button.info {
    color: rgb(var(--info));
  }

  .ub-toolbar__button.danger {
    color: rgb(var(--danger));
  }

  .ub-toolbar__button.warning {
    color: rgb(var(--warning));
  }

  .ub-toolbar__button i {
    font-size: 18px;
    margin-right: 4px;
  }
</style>
