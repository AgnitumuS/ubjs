<template>
  <div 
    class="ub-tabbar__context-menu" 
    v-if="visible" 
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

  methods: {
    close(action){
      this.resolveConfirm(action)
      this.visible = false
      this.$nextTick(this.$destroy)
    },

    clickOutside(e){
      if (!e.target.closest('.ub-tabbar__context-menu')){
        this.close()
      }
    }
  },

  mounted(){
    this.$nextTick(() => {
      window.addEventListener('click', this.clickOutside)
      window.addEventListener('contextmenu', this.clickOutside)
    })
  },

  beforeDestroy(){
    window.removeEventListener('click', this.clickOutside)
    window.removeEventListener('contextmenu', this.clickOutside)
  }
}
</script>