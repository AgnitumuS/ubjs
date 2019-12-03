<template>
  <div
    v-show="visible"
    ref="context"
    v-clickoutside="hideOnClickOutside"
    class="u-context-menu"
    :style="{
      top: y + 'px',
      left: x + 'px',
      width: width + 'px'
    }"
  >
    <template v-for="item in items">
      <div
        v-if="item.label !== '-'"
        :key="item.action"
        class="u-context-menu__item"
        :class="[item.disabled && 'disabled']"
        @click="itemSelected(item)"
      >
        <i
          v-if="item.iconCls"
          :class="item.iconCls"
          class="u-context-menu__item__icon"
        />
        <span>{{ $ut(item.label) }}</span>
      </div>
      <div
        v-else
        :key="item.action"
        class="u-context-menu__divider"
      />
    </template>
  </div>
</template>

<script>
/**
 * Show popup on mouse position
 *
 * @example
 * <div>
 *   <u-navbar-tab @right-click="$refs.context.show">
 *   <u-context-menu
 *     ref="context"
 *     :items="contextItems"
 *     @select="selectContext"
 *   />
 *  </div>
 */
export default {
  name: 'UContextMenu',
  props: {
    /**
     * Popup menu items
     * @type {Array<{label: string, action: string, disabled?: boolean, iconCls?: string}>}
     */
    items: {
      type: Array,
      required: true
    },

    /**
     * Context menu width
     */
    width: {
      type: Number,
      default: 180
    }
  },

  data () {
    return {
      visible: false,
      x: 0,
      y: 0,
      targetData: null
    }
  },

  methods: {
    itemSelected ({ action, disabled }) {
      if (!disabled) {
        this.$emit('select', action, this.targetData)
      }
      this.visible = false
    },

    hideOnClickOutside () {
      this.visible = false
    },

    show ({ x, y }, targetData) {
      this.visible = true
      this.x = x - 1
      this.y = y - 1
      this.targetData = targetData

      this.$nextTick(() => {
        const contextHeight = this.$refs.context.clientHeight
        const underBottom = y + contextHeight > window.innerHeight
        if (underBottom) {
          this.y = window.innerHeight - contextHeight
        }
      })
    }
  }
}
</script>

<style>
.u-context-menu {
  background-color: #fff;
  padding: 8px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(var(--info), 0.2);
  border-radius: 4px;
  top: 0;
  left: 0;
  position: fixed;
  z-index: 300000;
}

.u-context-menu__item {
  cursor: pointer;
  padding: 8px 16px;
}

.u-context-menu__item:hover {
  background-color: rgba(var(--info), 0.13);
}

.u-context-menu__item.disabled {
  color: rgb(var(--info));
  cursor: not-allowed;
  background-color: #fff;
}

.u-context-menu__item__icon {
  color: rgba(var(--table-text), 0.8);
  margin-right: 8px;
}

.u-context-menu__divider {
  background: rgba(var(--info), 0.1);
  margin: 4px 0;
  height: 1px;
}
</style>
