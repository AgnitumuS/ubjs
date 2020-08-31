<template>
  <div class="u-button-group">
    <slot />
  </div>
</template>

<script>
/**
 * Displayed as a button group, can be used to group a series of similar operations
 */
export default {
  name: 'UButtonGroup'
}
</script>

<style>
.u-button-group {
  display: flex;
}

.u-button-group > .u-button {
  border-radius: 0;
  z-index: 0;
  position: relative;
}

.u-button-group > .u-button:not(.u-button_appearance-default):hover {
  z-index: 1;
}

.u-button-group > .u-button:first-child {
  border-bottom-left-radius: var(--border-radius);
  border-top-left-radius: var(--border-radius);
}

.u-button-group > .u-button:last-child {
  border-bottom-right-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
}

.u-button-group > .u-button + .u-button {
  margin-left: -1px;
}

.u-button-group > .u-button_appearance-default + .u-button_appearance-default {
  border-left-color: hsl(var(--hs-background), var(--l-background-inverse));
}
</style>
