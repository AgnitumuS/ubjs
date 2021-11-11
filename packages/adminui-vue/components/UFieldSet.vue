<template>
  <div
    class="u-field-set"
    :class="{
      'u-field-set--collapse': !isExpanded
    }"
  >
    <div
      class="u-field-set__header"
      :class="['u-field-set__header--' + legendPosition.toLowerCase()]"
      @click="doExpand"
    >
      <!-- @slot content will be added instead of title. To cancel collapsing on click on content add `@click.stop` to the content  -->
      <slot name="label">
        <u-button
          appearance="inverse"
          size="small"
          :color="color"
          :icon="
            iconPosition === 'left' ? (isExpanded ? icons[0] : icons[1]) : ''
          "
          :right-icon="
            iconPosition === 'right' ? (isExpanded ? icons[0] : icons[1]) : ''
          "
        >
          {{ $ut(legend) }}
        </u-button>
      </slot>
    </div>
    <div
      ref="body"
      class="u-field-set__body"
      :style="style"
      @transitionend="handlerTransitionend"
    >
      <!-- @slot main content. Default slot  -->
      <slot />
      <div class="u-field-set__footer">
        <hr class="u-field-set__footer--line">
        <u-button
          appearance="inverse"
          icon="u-icon-arrow-up"
          class="u-field-set__footer--icon"
          @click="doExpand"
        >
          <!-- <i class="u-button__icon u-icon-arrow-up" /> -->
        </u-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UFieldSet',
  props: {
    /**
     * title text
     */
    legend: {
      type: String,
      default: ''
    },
    legendPosition: {
      type: String,
      default: 'left',
      validator: val => ['left', 'center', 'right'].includes(val)
    },
    iconPosition: {
      type: String,
      default: 'left',
      validator: val => ['left', 'right'].includes(val)
    },
    color: {
      type: String,
      default: 'primary'
    },
    icons: {
      type: Array,
      default: () => ['u-icon-circle-minus', 'u-icon-circle-plus'],
      validator: val => val.length === 2
    },
    initialExpanded: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      isExpanded: this.initialExpanded,
      style: {
        maxHeight: 'unset',
        paddingTop: '',
        paddingBottom: '',
        opacity: ''
      }
    }
  },
  created () {
    if (!this.isExpanded) {
      this.style.maxHeight = '0px'
      this.style.paddingTop = '0px'
      this.style.paddingBottom = '0px'
      this.style.opacity = '0'
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.handlerTransitionend()
    })
  },
  methods: {
    handlerTransitionend () {
      const { style } = this
      if (this.isExpanded && style.maxHeight !== '0px') {
        style.maxHeight = 'unset'
      }
    },
    doExpand () {
      this.isExpanded = !this.isExpanded
      this.setStyles()
    },
    setStyles () {
      const { body } = this.$refs
      body.style.maxHeight = body.scrollHeight + 'px'
      setTimeout(() => {
        this.style.maxHeight = this.isExpanded
          ? body.style.scrollHeight + 'px'
          : '0px'
        this.style.paddingTop = this.isExpanded ? '' : '0px'
        this.style.paddingBottom = this.isExpanded ? '' : '0px'
        this.style.opacity = this.isExpanded ? '1' : '0'
      }, 0)
    }
  }
}
</script>

<style>
.u-field-set {
  --borderStyle: 1px solid hsl(var(--hs-border), var(--l-layout-border-light));
  --shift: 10px;
  margin-top: var(--shift);
  margin-bottom: calc(var(--shift) * 2);
  border-radius: var(--border-radius);
  overflow: hidden;
}
.u-field-set.u-field-set--collapse {
  margin-bottom: var(--shift);
}

.u-field-set__header {
  background-color: hsl(var(--hs-primary), var(--l-background-default));
  position: relative;
  display: flex;
  padding: var(--shift);
  cursor: pointer;
}
.u-field-set__header--left {
  justify-content: flex-start;
  padding-left: calc(var(--shift) * 2);
}
.u-field-set__header--center {
  justify-content: center;
}
.u-field-set__header--right {
  justify-content: flex-end;
  padding-right: calc(var(--shift) * 2);
}
.u-field-set__body {
  transition-duration: 0.3s;
  overflow: hidden;
  padding: var(--shift) 0;
  box-sizing: content-box;
}
.u-field-set__footer {
  position: relative;
  margin-top: 16px;
}
.u-field-set__footer--line {
  border-color: hsl(var(--hs-border), var(--l-layout-border-light));
  border-top: none;
}
.u-field-set__footer--icon {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0 8px;
  border: none;
  color: hsl(var(--hs-text), var(--l-text-label));
  background-color: white;
  cursor: pointer;
}
</style>
