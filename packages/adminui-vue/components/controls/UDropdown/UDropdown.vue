<template>
  <div :key="renderKey">
    <div
      ref="reference"
      class="u-dropdown__reference"
      @click="toggleVisible"
    >
      <!-- @slot Reference button -->
      <slot />
    </div>

    <transition
      name="dropdown-transition"
      @before-enter="beforeEnter"
    >
      <div
        v-show="visible && $slots.dropdown"
        ref="dropdown"
      >
        <div class="u-dropdown">
          <div
            ref="arrow"
            class="u-dropdown__arrow"
          >
            <div class="u-dropdown__arrow-inner" />
          </div>

          <!-- @slot Dropdown -->
          <slot name="dropdown" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
const { createPopper } = require('@popperjs/core')
const {
  addClickOutsideListener,
  removeClickOutsideListener
} = require('../../../utils/clickOutside')

/**
 * Shows dropdown after click on reference element.
 * Can be used as context menu.
 */
export default {
  name: 'UDropdown',

  props: {
    /**
     * Position of element.
     * In Popper.js it option called strategy
     */
    position: {
      type: String,
      default: 'fixed',
      validator (value) {
        return ['fixed', 'absolute'].includes(value)
      }
    },

    /**
     * Popper placement relative to reference button
     */
    placement: {
      type: String,
      default: 'bottom-start'
    }
  },

  data () {
    return {
      visible: false,
      clickOutsideListenerId: 0,
      renderKey: 0,
      virtualElement: {
        getBoundingClientRect: this.generateClientRect(),
        contains: () => true,
        addEventListener () {},
        removeEventListener () {}
      }
    }
  },

  inject: {
    parentClose: {
      default () {
        return () => {}
      }
    }
  },

  provide () {
    return {
      parentClose: () => {
        this.parentClose()
        this.close()
      }
    }
  },

  watch: {
    async visible (isVisible) {
      await this.$nextTick()
      if (isVisible) {
        this.clickOutsideListenerId = addClickOutsideListener(
          [this.referenceEl, this.$refs.dropdown],
          this.close
        )
      } else {
        removeClickOutsideListener(this.clickOutsideListenerId)
      }
    }
  },

  methods: {
    toggleVisible () {
      this.visible = !this.visible
    },

    beforeEnter (el) {
      el.style.zIndex = this.$zIndex()
      this.referenceEl = this.$slots.default === undefined ? this.virtualElement : this.$refs.reference
      const arrow = this.$refs.arrow
      createPopper(this.referenceEl, this.$refs.dropdown, {
        strategy: this.position,
        placement: this.placement,
        modifiers: [{
          name: 'offset',
          options: { offset: [-5, 5] }
        }, {
          name: 'arrow',
          options: { padding: 5, element: arrow }
        }]
      })
    },

    close () {
      this.visible = false
      this.$emit('close')
    },

    async show ({ x, y, target }) {
      this.visible = false
      this.renderKey++
      await this.$nextTick()
      this.virtualElement.getBoundingClientRect = this.generateClientRect(x, y)
      this.virtualElement.contains = (ref) => target.contains(ref)
      this.visible = true
    },

    generateClientRect (x = 0, y = 0) {
      return () => ({
        width: 0,
        height: 0,
        top: y,
        right: x,
        bottom: y,
        left: x
      })
    }
  }
}
</script>

<style>
  .u-dropdown {
    --border-color: rgba(var(--info), 0.2);
    --popup-color: #fff;

    background: var(--popup-color);
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    border-radius: 4px;
    z-index: 10;
    padding: 6px 0;
  }

  .u-dropdown__reference {
    display: inline-block;
  }

  .u-dropdown .u-dropdown__reference {
    /* prevent inline-block for inner elements */
    display: block;
  }

  .dropdown-transition-leave-active,
  .dropdown-transition-enter-active {
    transition: visibility .1s;
  }

  .dropdown-transition-leave-active .u-dropdown,
  .dropdown-transition-enter-active .u-dropdown {
    transition: .1s;
  }

  .dropdown-transition-leave-to .u-dropdown,
  .dropdown-transition-enter .u-dropdown {
    transform: scale(0.8);
    opacity: 0;
  }

  .u-dropdown__arrow {
    --size: 4px;
    pointer-events: none;
    z-index: 1;
  }

  .u-dropdown__arrow-inner:before {
    content: '';
    position: absolute;
    border: var(--size) solid transparent;
    border-bottom-color: var(--border-color);
  }

  .u-dropdown__arrow-inner:after {
    content: '';
    position: absolute;
    border: var(--size) solid transparent;
    border-bottom-color: var(--popup-color);
    bottom: -1px;
  }

  .u-dropdown__arrow-inner {
    width: calc(var(--size) * 2);
    height: calc(var(--size) * 2);
  }

  [data-popper-placement^='bottom'] > .u-dropdown > .u-dropdown__arrow {
    bottom: 100%;
  }

  [data-popper-placement^='top'] > .u-dropdown > .u-dropdown__arrow {
    top: 100%;
  }

  [data-popper-placement^='top'] > .u-dropdown > .u-dropdown__arrow > .u-dropdown__arrow-inner {
    transform: rotate(180deg);
  }

  [data-popper-placement^='right'] > .u-dropdown > .u-dropdown__arrow {
    right: 100%;
  }

  [data-popper-placement^='right'] > .u-dropdown > .u-dropdown__arrow > .u-dropdown__arrow-inner {
    transform: rotate(-90deg);
  }

  [data-popper-placement^='left'] > .u-dropdown > .u-dropdown__arrow {
    left: 100%;
  }

  [data-popper-placement^='left'] > .u-dropdown > .u-dropdown__arrow > .u-dropdown__arrow-inner {
    transform: rotate(90deg);
  }
</style>

<docs>
  ### Basic usage

  ```vue
  <template>
    <u-dropdown>
      <el-button>click me</el-button>

      <template #dropdown>
        <u-dropdown-item label="item 1"/>
        <u-dropdown-item label="item 2"/>
        <u-dropdown-item label="item 3"/>
      </template>
    </u-dropdown>
  </template>
  ```

  ### Context menu

  For use as context menu just pass slot dropdown without default slot and use method show from UDropdown ref

  ```vue
  <template>
    <div>
      <div
        @contextmenu="showContextMenu"
        style="width: 200px; height: 200px; background: lightblue"
      />

      <u-dropdown ref="contextMenu">
        <template slot="dropdown">
          <u-dropdown-item label="item 1"/>
          <u-dropdown-item label="item 2"/>
          <u-dropdown-item label="item 3"/>
        </template>
      </u-dropdown>
    </div>
  </template>

  <script>
    export default {
      methods: {
        showContextMenu(event) {
          this.$refs.contextMenu.show(event)
        }
      }
    }
  </script>
  ```
</docs>
