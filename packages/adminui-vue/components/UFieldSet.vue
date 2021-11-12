<template>
  <div
    class="u-field-set"
    :class="{
      'u-field-set--collapse': !isExpanded
    }"
  >
    <div
      class="u-field-set__header"
      :class="['u-field-set__header--' + titleAlign.toLowerCase()]"
      @click="toggleExpanding"
    >
      <!-- @slot content will be added instead of title. To cancel collapsing on click on content add `@click.stop` to the content  -->
      <slot name="title">
        <u-button
          appearance="inverse"
          size="small"
          :color="titleColor"
          :icon="
            iconPosition === 'left' ? (isExpanded ? icons[0] : icons[1]) : ''
          "
          :right-icon="
            iconPosition === 'right' ? (isExpanded ? icons[0] : icons[1]) : ''
          "
        >
          {{ $ut(title) }}
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
          v-if="expandable"
          appearance="inverse"
          icon="u-icon-arrow-up"
          class="u-field-set__footer--icon"
          @click="toggleExpanding"
        >
        </u-button>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * A Form building block what visually groups together several controls.
 *
 * Can be expandable, title can contains text and (optionally custom) icon.
 *
 * To be used instead of *el-card*  / *Ext.form.FieldSet *
 */
export default {
  name: 'UFieldSet',
  model: {
    prop: 'expanded',
    event: 'toggleExpanding'
  },
  props: {
    /**
     * title text. Will be translated using UB.i18n
     */
    title: {
      type: String,
      default: ''
    },
    /**
     * position of content which is in title slot
     */
    titleAlign: {
      type: String,
      default: 'left',
      validator: val => ['left', 'center', 'right'].includes(val)
    },
    /**
     * position of the icon relative to the title
     */
    iconPosition: {
      type: String,
      default: 'left',
      validator: val => ['left', 'right'].includes(val)
    },
    /**
     * color of title text and icon
     */
    titleColor: {
      type: String,
      default: 'primary',
      validator (value) {
        return ['control', 'primary', 'success', 'danger', 'warning'].includes(
          value
        )
      }
    },
    /**
     * icons for expanded/collapse state
     */
    icons: {
      type: Array,
      default: () => ['u-icon-circle-minus', 'u-icon-circle-plus'],
      validator: val => val.length === 2
    },
    /**
     * enable/disable toggle expanding function
     */
    expandable: {
      type: Boolean,
      default: true
    },
    /**
     * expanded state. Work with v-model
     */
    expanded: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      isExpanded: this.expanded,
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
      if (!this.expandable) return
      const { style } = this
      if (this.isExpanded && style.maxHeight !== '0px') {
        style.maxHeight = 'unset'
      }
    },
    toggleExpanding () {
      if (!this.expandable) return
      this.isExpanded = !this.isExpanded
      this.setStyles()
      /**
       * Triggers when the user toggle state
       * @property {boolean}
       */
      this.$emit('toggleExpanding', this.isExpanded)
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
.u-field-set--expandable .u-field-set__header,
.u-field-set--expandable .u-field-set__footer--icon {
  cursor: pointer;
}

.u-field-set__header {
  background-color: hsl(var(--hs-primary), var(--l-background-default));
  position: relative;
  display: flex;
  padding: var(--shift);
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
  background-color: white;
  color: hsl(var(--hs-text), var(--l-text-disabled));
}
</style>

<docs>
### Basic usage

```vue
<template>
  <u-field-set title="Basic usage">
    <h1>Field set content</h1>
    <u-form-row
      label="User name (required)"
    >
      <u-base-input />
    </u-form-row>
  </u-field-set>
</template>
```

### Advanced usage

 - Turn expandable (by checking checkbox)
 - title align
 - custom icon

``` vue
<template>
  <div>
  <p>Expanded: {{fieldSetExpanded ? 'Yes' : 'No'}}</p>
  <p>Expandable <input type="checkbox" v-model="expandable"></input> </p>
  <u-field-set
      v-model="fieldSetExpanded"
      :expandable="expandable"
      title="Advanced usage"
      title-align="center"
      icon-position="right"
      title-color="danger"
      :icons="['u-icon-eye', 'u-icon-eye-slash']"
    >
    <h1>Field set content</h1>
    <u-form-row
      label="User name (required)"
    >
      <u-base-input />
    </u-form-row>

  </u-field-set>
  </div>
</template>

<script>
export default {
    data () {
    return {
      expandable: true,
      fieldSetExpanded: true
    }
  },
}
</script>
```
</docs>
