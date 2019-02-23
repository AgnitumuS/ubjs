<template>
  <div 
    class="ub-tabbar__context-menu" 
    v-show="visible" 
    :style="{
      top: y + 'px',
      left: x + 'px'    
    }" 
    >
    <div @click="close('close')" class="ub-tabbar__context-menu__item">
      {{ $ut('close') }}
    </div>
    
    <div @click="close('closeOther')" class="ub-tabbar__context-menu__item">
      {{ $ut('closeOther') }}
    </div>

    <div class="ub-tabbar__context-menu__divider"></div>

    <div @click="close('closeAll')" class="ub-tabbar__context-menu__item">
      {{ $ut('closeAll') }}
    </div>
  </div>
</template>

<script>
module.exports = {
  name: 'tabbar-context',

  data(){
    return {
      visible: false,
      x: 0,
      y: 0,
      tab: null
    }
  },

  methods: {
    close(action){
      this.$emit('close', action, this.tab)
      this.visible = false
    },

    clickOutside({target}){
      const outsideContext = !target.closest('.ub-tabbar__context-menu')
      const outsideTab = !target.closest('.ub-tabbar__tab')
      if (outsideContext && outsideTab){
        this.visible = false
      }
    },

    show({x, y}, tab){
      this.visible = true
      this.x = x
      this.y = y
      this.tab = tab
    }
  },

  mounted(){
    window.addEventListener('click', this.clickOutside)
    window.addEventListener('contextmenu', this.clickOutside)
  },
}
</script>