<template>
  <div
    v-show="visible"
    ref="context"
    v-clickoutside="hideOnClickOutside"
    class="u-context-menu"
    :style="{
      top: y + 'px',
      left: x + 'px'
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
        <i :class="item.iconCls" />
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
   <div>
     <u-navbar-tab @right-click="$refs.context.show">
     <u-context
       ref="context"
       :items="contextItems"
       @select="selectContext"
     />
    </div>
 */
export default {
  name: 'UContextMenu',
  props: {
    /**
     * Popup menu items
     * @type {Array<{label: string, action: string, disabled?: boolean}>}
     */
    items: {
      type: Array,
      required: true
    }
  },

  data () {
    return {
      visible: false,
      /** is context menu in process of showing */
      showing: false,
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
      if (!this.showing) this.visible = false
    },

    show ({ x, y }, targetData) {
      this.showing = true
      this.visible = true
      this.x = x
      this.y = y
      this.targetData = targetData

      this.$nextTick(() => {
        const contextHeight = this.$refs.context.clientHeight
        const underBottom = y + contextHeight > window.innerHeight
        if (underBottom) {
          this.y = window.innerHeight - contextHeight
        }
        this.showing = false
      })
    }
  }
}
</script>

<style>
.u-context-menu {
  background-color: #fff;
  width: 200px;
  padding: 8px 0;
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #ccc;
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
  background-color: #f8f8f8;
}

.u-context-menu__item.disabled {
  color: rgb(var(--info));
}

.u-context-menu__divider {
  border-bottom: 1px solid #eee;
  margin: 8px 0;
}
</style>
