<template>
  <div id="RoleActionsComponent" class="role-actions-component">
    <i v-for="action in actions" :key="action.value"
       :class="action.icon"
       aria-hidden="true"
       :style="{ color: currentValue >= action.value ? activeColor : defaultColor}"
       @click="doSomething(action)"
    ></i>
  </div>
</template>

<script>
  module.exports = {
    props: {
      value: [Number, String]
    },
    name: 'RoleActionsComponent',
    data () {
      return {
        actions: [{
          icon: 'fa fa-book',
          value: 1
        }, {
          icon: 'fa fa-pencil',
          value: 3
        }, {
          icon: 'fa fa-asterisk',
          value: 7
        }],
        currentValue: this.value,
        activeColor: '#409eff',
        defaultColor: '#e1ddd9'
      }
    },
    watch: {
      value (value) {
        this.currentValue = value
      }
    },
    methods: {
      doSomething (action) {
        if (this.currentValue !== action.value) {
          this.currentValue = action.value
        } else {
          this.currentValue = this.actions.indexOf(action) === 0 ? 0 : this.actions[this.actions.indexOf(action) - 1].value
        }
        this.$emit('input', this.currentValue)
      }
    }
  }
</script>