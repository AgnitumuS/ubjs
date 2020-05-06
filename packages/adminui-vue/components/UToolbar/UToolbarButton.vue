<template>
  <el-tooltip
    :content="$ut(tooltip)"
    placement="bottom"
    :open-delay="300"
    :enterable="false"
    :disabled="!tooltip"
  >
    <button
      class="u-toolbar__button"
      :class="color"
      type="button"
      v-bind="$attrs"
      :disabled="disabled"
      v-on="$listeners"
    >
      <i
        class="u-toolbar__button-icon"
        :class="icon"
      />
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
  .u-toolbar__button{
    background: none;
    border: none;
    padding: 0 8px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: transform 0.1s;
    height: 100%;
    --hs: var(--hs-primary);
    --l: var(--l-state-default);
    color: hsl(var(--hs), var(--l));
  }

  .u-toolbar__button:disabled{
    --l: var(--l-state-disabled);
    cursor: not-allowed;
  }

  .u-toolbar__button:not(:disabled):hover{
    --l: var(--l-state-hover);
  }

  .u-toolbar__button:active{
    --l: var(--l-state-active);
  }

  .u-toolbar__button.primary {
    --hs: var(--hs-primary);
  }
  .u-toolbar__button.success {
    --hs: var(--hs-success);
  }
  .u-toolbar__button.warning {
    --hs: var(--hs-warning);
  }
  .u-toolbar__button.danger {
    --hs: var(--hs-danger);
  }
  .u-toolbar__button.secondary {
    --hs: var(--hs-control);
  }

  .u-toolbar__button-icon {
    font-size: 20px;
    margin-right: 4px;
  }
</style>
