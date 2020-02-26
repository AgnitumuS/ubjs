<template>
  <div
    v-clickoutside="hideDropdown"
    class="u-dropdown__container"
  >
    <div
      class="u-dropdown__trigger"
      @click="visible = !visible"
    >
      <slot />
    </div>

    <transition name="dropdown-anim">
      <div
        v-show="visible"
        class="u-dropdown"
        :style="{ width: width + 'px' }"
      >
        <slot name="dropdown" />
      </div>
    </transition>
  </div>
</template>

<script>
/**
 * Wrap element which passed as default slot and shows dropdown on click of this element
 */
export default {
  name: 'UDropdown',

  props: {
    /**
     * dropdown width in "px"
     */
    width: {
      type: Number,
      default: 180
    }
  },

  data () {
    return {
      visible: false
    }
  },

  provide () {
    // provides hide action for child components
    return {
      hideDropdown: this.hideDropdown
    }
  },

  methods: {
    hideDropdown () {
      this.visible = false
    }
  }
}
</script>

<style>
.u-dropdown__container{
  position: relative;
}

.u-dropdown{
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  border: 1px solid rgba(var(--info), 0.2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  z-index: 10;
  padding: 6px 0;
}

.dropdown-anim-leave-active,
.dropdown-anim-enter-active {
  transition: .1s;
}

.dropdown-anim-leave-to,
.dropdown-anim-enter {
  opacity: 0;
  transform: translateY(-5px);
}
</style>

<docs>
```vue
<template>
  <u-dropdown class="u-table-entity__head__dropdown">
    <el-button icon="el-icon-setting"/>

    <template slot="dropdown">
      <u-dropdown-item
        icon="el-icon-refresh"
        label="refresh"
      />
      <u-dropdown-item
        icon="el-icon-plus"
        label="actionAdd"
      />
      <u-dropdown-item divider />
      <u-dropdown-item
        icon="el-icon-edit"
        label="Edit"
        disabled
      />
      <u-dropdown-item
        icon="el-icon-copy-document"
        label="Copy"
      />
      <u-dropdown-item
        icon="el-icon-delete"
        label="Delete"
      />
    </template>
  </u-dropdown>
</template>
```
</docs>
