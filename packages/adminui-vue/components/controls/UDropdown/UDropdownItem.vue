<template>
  <div
    v-if="divider"
    class="u-dropdown-item__divider"
  />
  <div
    v-else
    class="u-dropdown-item"
    :class="{
      disabled: disabled
    }"
    @click="onClick"
  >
    <i
      class="u-dropdown-item__icon"
      :class="icon"
    />
    <span class="u-dropdown-item__label">
      {{ $ut(label) }}
    </span>
  </div>
</template>

<script>
/**
 * Child of UDropdown
 */
export default {
  name: 'UDropdownItem',

  props: {
    /**
     * Icon class
     */
    icon: String,

    /**
     * Item text
     */
    label: String,

    /**
     * Render divider ignore other props
     */
    divider: Boolean,

    /**
     * Disabled state
     */
    disabled: Boolean,

    /**
     * Hide dropdown on click item. Add's a possibility to do child dropdown lists without closing dropdown
     */
    hideOnClick: {
      type: Boolean,
      default: true
    }
  },

  inject: ['hideDropdown'],

  methods: {
    onClick (e) {
      if (this.disabled) return
      if (this.hideOnClick) {
        this.hideDropdown()
      }

      this.$emit('click', e)
    }
  }
}
</script>

<style>
.u-dropdown-item{
  display: flex;
  align-items: center;
  cursor: pointer;
}

.u-dropdown-item:hover {
  background: rgba(var(--info), 0.13);
}

.u-dropdown-item__icon{
  font-size: 14px;
  color: rgba(var(--table-text), 0.8);
  width: 14px;
  height: 14px;
  margin-left: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.u-dropdown-item__label{
  color: rgb(var(--table-text));
  font-size: 14px;
  line-height: 1.4;
  padding: 8px;
  margin-left: 4px;
}

.u-dropdown-item__divider{
  width: 100%;
  height: 1px;
  background: rgba(var(--info), 0.2);
  margin: 6px 0;
}

.u-dropdown-item.disabled{
  opacity: 0.5;
  cursor: not-allowed;
}

.u-dropdown-item.disabled:hover{
  background: #fff;
}
</style>
