<template>
  <el-tooltip
    :content="$ut(tooltip)"
    placement="bottom"
    :open-delay="300"
    :enterable="false"
    :disabled="!tooltip"
  >
    <u-button
      class="u-toolbar-button"
      :appearance="appearance"
      :icon="icon"
      :color="transformedColor"
      :disabled="disabled"
      v-bind="$attrs"
      v-on="$listeners"
    />
  </el-tooltip>
</template>

<script>
/**
 * @deprecated Legacy component, use UButton instead it
 * @example
 *   <el-tooltip :content="Edit">
 *     <u-button
 *       appearance="inverse"
 *       icon="u-icon-edit"
 *     />
 *   </el-tooltip>
 */
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
    disabled: Boolean,

    appearance: {
      type: String,
      default: 'inverse'
    }
  },

  data () {
    return {
      colorMap: {
        primary: 'primary',
        secondary: 'success',
        info: 'control',
        danger: 'danger',
        warning: 'warning'
      }
    }
  },

  computed: {
    /**
     * Transform legacy color definition according UButton colors
     *
     * @return {string}
     */
    transformedColor () {
      return this.colorMap[this.color]
    }
  }
}
</script>
