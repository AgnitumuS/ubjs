<template>
  <button
    class="u-button"
    :class="[
      `u-button_appearance-${appearance}`,
      `u-button_color-${color}`,
      `u-button_size-${size}`,
      {
        'u-button_has-icon': icon || rightIcon,
        'u-button_has-text': $slots.default
      }
    ]"
    v-on="$listeners"
  >
    <i
      v-if="icon"
      class="u-button__icon"
      :class="icon"
    />
    <span
      v-if="$slots.default"
      class="u-button__label"
    >
      <slot />
    </span>
    <i
      v-if="rightIcon"
      class="u-button__icon"
      :class="[rightIcon, icon]"
    />
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
    cursor: pointer;
    background: hsl(var(--hs), var(--l));
    border-radius: var(--border-radius);
    border: 1px solid hsl(var(--hs), var(--l));
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .u-button.u-button_has-icon {
    padding: 0;
  }

  /* SIZES BEGIN */
  /* Size: small */
  .u-button_size-small {
    font-size: 14px;
  }

  .u-button_size-small .u-button__icon {
    font-size: 16px;
  }

  .u-button_size-small .u-button__icon,
  .u-button_size-small .u-button__label {
    padding: 4px;
  }

  .u-button_size-small.u-button_has-text {
    padding: 0 20px;
  }

  .u-button_size-small.u-button_has-text.u-button_has-icon {
    padding: 0 8px;
  }

  /* Size: medium */
  .u-button_size-medium {
    font-size: 16px;
  }

  .u-button_size-medium .u-button__icon {
    font-size: 18px;
  }

  .u-button_size-medium .u-button__icon,
  .u-button_size-medium .u-button__label {
    padding: 8px;
  }

  .u-button_size-medium.u-button_has-text {
    padding: 0 24px;
  }

  .u-button_size-medium.u-button_has-text.u-button_has-icon {
    padding: 0 16px;
  }

  /* Size: large */
  .u-button_size-large {
    font-size: 18px;
  }

  .u-button_size-large .u-button__icon {
    font-size: 20px;
  }

  .u-button_size-large .u-button__icon,
  .u-button_size-large .u-button__label {
    padding: 12px;
  }

  .u-button_size-large.u-button_has-text {
    padding: 0 28px;
  }

  .u-button_size-large.u-button_has-text.u-button_has-icon {
    padding: 0 20px;
  }
  /* SIZES END */

  .u-button__icon {
    font-size: 1em;
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
