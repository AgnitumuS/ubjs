<template>
  <button
    :class="[
      `u-button_appearance-${appearance}`,
      `u-button_color-${color}`,
      `u-button_size-${size}`
    ]"
    class="u-button"
    v-on="$listeners"
  >
    <span class="u-button__container">
      <i
        v-if="icon"
        :class="icon"
      />
      <span v-if="$slots.default"><slot /></span>
      <i
        v-if="rightIcon"
        :class="[rightIcon, icon]"
      />
    </span>
  </button>
</template>

<script>
export default {
  name: 'UButton',

  props: {
    /**
     * Left icon css class
     */
    icon: String,

    /**
     * Right icon css class
     */
    rightIcon: String,

    /**
     * Button size
     */
    size: {
      type: String,
      default: 'medium',
      validator (value) {
        return ['small', 'medium', 'large'].includes(value)
      }
    },

    /**
     * Button render appearance
     */
    appearance: {
      type: String,
      default: 'default',
      validator (value) {
        return ['default', 'inverse', 'plain'].includes(value)
      }
    },

    /**
     * Button color
     */
    color: {
      type: String,
      default: 'primary',
      validator (value) {
        return ['control', 'primary', 'success', 'danger', 'warning'].includes(value)
      }
    }
  }
}
</script>

<style>
  .u-button {
    --hs: var(--hs-control);
    --l: var(--l-state-default);
    color: hsl(var(--hs-text), var(--l-text-inverse));
    padding: 0.2em 0.6em;
    cursor: pointer;
    background: hsl(var(--hs), var(--l));
    border-radius: var(--border-radius);
    border: 1px solid hsl(var(--hs), var(--l));
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .u-button span {
    font-size: 0.9em;
  }

  .u-button__container {
    margin: -2px;
    display: inline-flex;
    align-items: center;
  }

  .u-button__container > * {
    padding: 2px;
  }

  .u-button_appearance-inverse {
    color: hsl(var(--hs), var(--l));
    border-color: transparent;
    background: none;
  }

  .u-button_appearance-plain {
    background: hsl(var(--hs), var(--l-background-default));
    color: hsl(var(--hs), var(--l));
  }

  .u-button:disabled {
    --l: var(--l-state-disabled);
    cursor: not-allowed;
  }

  .u-button:hover:not(:disabled) {
    --l: var(--l-state-hover);
  }

  .u-button:active:not(:disabled) {
    --l: var(--l-state-active);
  }

  .u-button_color-control {
    --hs: var(--hs-control)
  }

  .u-button_color-primary {
    --hs: var(--hs-primary)
  }

  .u-button_color-success {
    --hs: var(--hs-success)
  }

  .u-button_color-danger {
    --hs: var(--hs-danger)
  }

  .u-button_color-warning {
    --hs: var(--hs-warning)
  }

  .u-button_size-small {
    font-size: 18px;
  }

  .u-button_size-medium {
    font-size: 22px;
  }

  .u-button_size-large {
    font-size: 26px;
  }
</style>

<docs>
### Color

```vue
<template>
  <div>
    <h1>Primary by default</h1>
    <u-button>Default</u-button>

    <h1>Colors</h1>
    <u-button color="primary">Default</u-button>
    <u-button color="control">Default</u-button>
    <u-button color="success">Default</u-button>
    <u-button color="warning">Default</u-button>
    <u-button color="danger">Default</u-button>

    <h1>Disabled</h1>
    <u-button disabled color="primary">Default</u-button>
    <u-button disabled color="control">Default</u-button>
    <u-button disabled color="success">Default</u-button>
    <u-button disabled color="warning">Default</u-button>
    <u-button disabled color="danger">Default</u-button>
  </div>
</template>
```

### Appearance

```vue
<template>
  <div>
    <h1>Plain</h1>
    <u-button appearance="plain" color="primary">Default</u-button>
    <u-button appearance="plain" color="control">Default</u-button>
    <u-button appearance="plain" color="success">Default</u-button>
    <u-button appearance="plain" color="warning">Default</u-button>
    <u-button appearance="plain" color="danger">Default</u-button>

    <h1>Inverse</h1>
    <u-button appearance="inverse" color="primary">Default</u-button>
    <u-button appearance="inverse" color="control">Default</u-button>
    <u-button appearance="inverse" color="success">Default</u-button>
    <u-button appearance="inverse" color="warning">Default</u-button>
    <u-button appearance="inverse" color="danger">Default</u-button>
  </div>
</template>
```

### With icon

```vue
<template>
  <div>
    <h1>Icon only</h1>
    <u-button icon="u-icon-save"/>
    <u-button appearance="plain" icon="u-icon-save"/>
    <u-button appearance="inverse" icon="u-icon-save"/>

    <h1>Icon left</h1>
    <u-button icon="u-icon-save">Default</u-button>
    <u-button appearance="plain" icon="u-icon-save">Default</u-button>
    <u-button appearance="inverse" icon="u-icon-save">Default</u-button>

    <h1>Icon right</h1>
    <u-button right-icon="u-icon-save">Default</u-button>
    <u-button appearance="plain" right-icon="u-icon-save">Default</u-button>
    <u-button appearance="inverse" right-icon="u-icon-save">Default</u-button>

    <h1>Icon left and right</h1>
    <u-button icon="u-icon-save" right-icon="u-icon-arrow-right">Default</u-button>
    <u-button appearance="plain" icon="u-icon-save" right-icon="u-icon-arrow-right">Default</u-button>
    <u-button appearance="inverse" icon="u-icon-save" right-icon="u-icon-arrow-right">Default</u-button>
  </div>
</template>
```

### Size

```vue
<template>
  <div>
    <u-button icon="u-icon-save" size="small">Small</u-button>
    <u-button icon="u-icon-save" size="medium">Medium</u-button>
    <u-button icon="u-icon-save" size="large">Large</u-button>
  </div>
</template>
```
</docs>
