<template>
  <div
    class="u-field-set"
    :class="{
      'u-field-set--collapse': !isExpanded,
      'u-field-set--card-mode': cardMode
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
    cardMode: {
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
    this.$nextTick(() => {
      this.setStyles()
      if (this.dynamicContent) this.setObserver()
    })
  },
  beforeDestroy () {
    if (this.observer) this.observer.disconnect()
  },
  methods: {
    doExpand () {
      this.isExpanded = !this.isExpanded
      this.setStyles()
    },
    setStyles () {
      const { body } = this.$refs
      body.style.maxHeight = this.isExpanded ? body.scrollHeight + 'px' : '0px'
      body.style.paddingTop = this.isExpanded ? '' : '0px'
      body.style.paddingBottom = this.isExpanded ? '' : '0px'
      body.style.opacity = this.isExpanded ? '1' : '0'
    },
    setObserver () {
      const { body } = this.$refs
      if (!body) return
      const config = {
        childList: true,
        subtree: true
      }
      this.observer = new MutationObserver(() => this.setStyles())
      this.observer.observe(body, config)
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

.u-field-set--card-mode {
  margin-left: var(--shift);
  margin-right: var(--shift);
  box-shadow: 0px 4px 12px 0 rgb(0 0 0 / 15%);
}
.u-field-set--card-mode .u-field-set__body {
  padding-left: var(--shift);
  padding-right: var(--shift);
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
  border-top: var(--borderStyle);
  border-bottom: var(--borderStyle);
}
</style>
