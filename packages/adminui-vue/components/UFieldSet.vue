<template>
  <div
    class="u-field-set"
    :class="{
      'u-field-set--collapse': !isExpanded,
      'u-field-set--margin': withMargin
    }"
  >
    <div
      class="u-field-set__header"
      :class="['u-field-set__header--' + legendPosition.toLowerCase()]"
      @click="doExpand"
    >
      <slot name="label">
        <u-button
          appearance="inverse"
          size="small"
          :color="color"
          :icon="isExpanded ? icons[0] : icons[1]"
        >
          {{ $ut(legend) }}
        </u-button>
      </slot>
    </div>
    <div
      ref="body"
      class="u-field-set__body"
    >
      <slot :name="legend" />
    </div>
  </div>
</template>

<script>
const { getCSSVarValue } = require('../helpers/index.js')

export default {
  name: 'UFieldSet',
  props: {
    legend: {
      type: String,
      default: ''
    },
    legendPosition: {
      type: String,
      default: 'left',
      validator: val => ['left', 'center', 'right'].includes(val)
    },
    color: {
      type: String,
      default: 'primary'
    },
    withMargin: {
      type: Boolean,
      default: false
    },
    icons: {
      type: Array,
      default: () => ['u-icon-circle-minus', 'u-icon-circle-plus'],
      validator: val => val.length === 2
    },
    dynamicContent: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      isExpanded: true,
      observer: null
    }
  },
  mounted () {
    this.setMaxHeight()
    if (this.dynamicContent) this.setObserver()
  },
  beforeDestroy () {
    if (this.observer) this.observer.disconnect()
  },
  methods: {
    doExpand () {
      this.isExpanded = !this.isExpanded
      this.setMaxHeight()
    },
    setMaxHeight () {
      const { body } = this.$refs
      body.style.maxHeight = this.isExpanded ? body.scrollHeight + 'px' : '0px'
      body.style.padding = this.isExpanded
        ? getCSSVarValue(body, '--bodyPadding')
        : '0px'
    },
    setObserver () {
      const { body } = this.$refs
      if(!body) return;
      const config = {
        childList: true,
        subtree: true
      }
      this.observer = new MutationObserver(() => this.setMaxHeight())
      this.observer.observe(body, config)
    }
  }
}
</script>

<style>
.u-field-set {
  --borderStyle: 1px solid hsl(var(--hs-border), var(--l-layout-border-light));
  margin-top: 10px;
  margin-bottom: 10px;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.u-field-set--margin {
  margin: 8px;
}
.u-field-set--collapse .u-field-set__header {
  background-color: hsl(var(--hs-primary), var(--l-background-active));
}
.u-field-set--collapse .u-field-set__body {
  border: none;
}
.u-field-set__header {
  background-color: hsl(var(--hs-primary), var(--l-background-default));
  position: relative;
  display: flex;
  padding: 10px;
  cursor: pointer;
}
.u-field-set__header--left {
  justify-content: flex-start;
  padding-left: 20px;
}
.u-field-set__header--center {
  justify-content: center;
}
.u-field-set__header--right {
  justify-content: flex-end;
  padding-right: 20px;
}
.u-field-set__body {
  --bodyPadding: 10px 0;
  transition-duration: 0.3s;
  overflow: hidden;
  padding: var(--bodyPadding);
  box-sizing: content-box;
  border-top: var(--borderStyle);
  border-bottom: var(--borderStyle);
}
</style>
