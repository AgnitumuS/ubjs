<template>
  <div
    v-show="visible"
    ref="context"
    class="ub-context-menu"
    :style="{
      top: y + 'px',
      left: x + 'px'
    }"
  >
    <div
      v-for="item in items"
      v-if="item.label !== '-'"
      :key="item.action"
      class="ub-context-menu__item"
      :class="[item.disabled && 'disabled']"
      @click="close(item)"
    >
      <i :class="item.iconCls" />
      <span>{{ $ut(item.label) }}</span>
    </div>
    <div
      v-else
      class="ub-context-menu__divider"
    />
  </div>
</template>

<script>
export default {
  name: 'UbContext',
  props: {
    items: Array,
    clickOutsideTargets: {
      type: String,
      required: true
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
    close ({ action, disabled }) {
      if (!disabled) {
        this.$emit('select', action, this.targetData)
      }
      this.visible = false
    },

    clickOutside ({ target, type }) {
      const outsideContext = !target.closest('.ub-context-menu')
      const outsideTarget = !target.closest(this.clickOutsideTargets) || type === 'click'
      if (outsideContext && outsideTarget) {
        this.visible = false
      }
    },

    show ({ x, y }, targetData) {
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
      })
    }
  },

  mounted () {
    window.addEventListener('click', this.clickOutside)
    window.addEventListener('contextmenu', this.clickOutside)
  }
}
</script>

<style>
.ub-context-menu {
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

.ub-context-menu__item {
  cursor: pointer;
  padding: 8px 16px;
}

.ub-context-menu__item:hover {
  background-color: #f8f8f8;
}

.ub-context-menu__item.disabled {
  color: rgb(var(--info));
}

.ub-context-menu__divider {
  border-bottom: 1px solid #eee;
  margin: 8px 0;
}
</style>
