<template>
  <div
    v-show="visible"
    class="ub-tabbar__context-menu"
    :style="{
      top: y + 'px',
      left: x + 'px'
    }"
  >
    <div
      class="ub-tabbar__context-menu__item"
      @click="close('close')"
    >
      {{ $ut('close') }}
    </div>

    <div
      class="ub-tabbar__context-menu__item"
      @click="close('closeOther')"
    >
      {{ $ut('closeOther') }}
    </div>

    <div class="ub-tabbar__context-menu__divider" />

    <div
      class="ub-tabbar__context-menu__item"
      @click="close('closeAll')"
    >
      {{ $ut('closeAll') }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'UbTabbarContext',

  data () {
    return {
      visible: false,
      x: 0,
      y: 0,
      tab: null
    }
  },

  methods: {
    close (action) {
      this.$emit('close', action, this.tab)
      this.visible = false
    },

    clickOutside ({target}) {
      const outsideContext = !target.closest('.ub-tabbar__context-menu')
      const outsideTab = !target.closest('.ub-tabbar__tab')
      if (outsideContext && outsideTab) {
        this.visible = false
      }
    },

    show ({x, y}, tab) {
      this.visible = true
      this.x = x
      this.y = y
      this.tab = tab
    }
  },

  mounted () {
    window.addEventListener('click', this.clickOutside)
    window.addEventListener('contextmenu', this.clickOutside)
  }
}
</script>

<style>
.ub-tabbar__context-menu {
  background-color: #fff;
  width: 200px;
  padding: 8px 0;
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #ccc;
  top: 0;
  left: 0;
  position: fixed;
  z-index: 99;;
}

.ub-tabbar__context-menu__item {
  cursor: pointer;
  padding: 8px 16px;
}

.ub-tabbar__context-menu__item:hover {
  background-color: #f8f8f8;
}

.ub-tabbar__context-menu__divider {
  border-bottom: 1px solid #eee;
  margin: 8px 0;
}
</style>
