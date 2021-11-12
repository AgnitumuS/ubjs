<template>
  <div
    class="u-field-set"
    :class="{
      'u-field-set--collapse': !isExpanded,
      'u-field-set--expandable': expandable
    }"
  >
    <div
      class="u-field-set__header"
      :class="['u-field-set__header--' + titleAlign.toLowerCase()]"
      @click="toggleExpanding"
    >
      <!-- @slot content will be added instead of title. To cancel collapsing on click on content add `@click.stop` to the content  -->
      <slot name="label">
        <u-button
          :disabled="!expandable"
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
          :disabled="!expandable"
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
export default {
  name: 'UFieldSet',
  model: {
    prop: 'expanded',
    event: 'toggleExpanding'
  },
  props: {
    /**
     * title text
     */
    title: {
      type: String,
      default: ''
    },
    /**
     * position of content which is in label slot
     */
    titleAlign: {
      type: String,
      default: 'left',
      validator: val => ['left', 'center', 'right'].includes(val)
    },
    /**
     * position of icon relative to title.
     */
    iconPosition: {
      type: String,
      default: 'left',
      validator: val => ['left', 'right'].includes(val)
    },
    /**
     * color of title.
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
     * Icons for exnanded/collapse state
     */
    icons: {
      type: Array,
      default: () => ['u-icon-circle-minus', 'u-icon-circle-plus'],
      validator: val => val.length === 2
    },
    /**
     * State for first render. Work with v-model
     */
    expanded: {
      type: Boolean,
      default: true
    },
    /**
     * Enable/disable toggle expanding function
     */
    expandable: {
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
.u-field-set--expandable .u-field-set__footer--icon {
  color: hsl(var(--hs-text), var(--l-text-label));
}
</style>

<docs>
### Basic usage

```vue
<template>
  <u-field-set title="Basic usage">
       <table>
        <thead>
          <tr>
            <th>FirstName</th>
            <th>LastName</th>
            <th>DOB</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Artem</td>
            <td>Strekalov</td>
            <td>1994</td>
          </tr>
          <tr>
            <td>Ivan</td>
            <td>Ivanov</td>
            <td>1997</td>
          </tr>
          <tr>
            <td>Victor</td>
            <td>Kozybenko</td>
            <td>1993</td>
          </tr>
        </tbody>
      </table>
  </u-field-set>
</template>
```

### Advanced usage

``` vue
<template>
  <u-field-set
      title="Advanced usage"
      title-align="center"
      icon-position="right"
      title-color="success"
      :icons="['u-icon-arrow-down', 'u-icon-arrow-up']"
      :initial-expanded="false"
    >
      <table>
        <thead>
          <tr>
            <th>FirstName</th>
            <th>LastName</th>
            <th>DOB</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Artem</td>
            <td>Strekalov</td>
            <td>1994</td>
          </tr>
          <tr>
            <td>Ivan</td>
            <td>Ivanov</td>
            <td>1997</td>
          </tr>
          <tr>
            <td>Victor</td>
            <td>Kozybenko</td>
            <td>1993</td>
          </tr>
        </tbody>
      </table>
  </u-field-set>
</template>
```
</docs>
