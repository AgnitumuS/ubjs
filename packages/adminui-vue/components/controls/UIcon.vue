<template>
  <i
    v-if="icon"
    class="u-icon"
    :class="[
      icon,
      `u-icon_color-${color}`,
      `u-icon_size-${size}`
    ]"
  />
</template>

<script>
export default {
  name: 'UIcon',

  props: {
    /**
     * Icon color
     */
    color: {
      type: String,
      default: 'control',
      validator (value) {
        return ['primary', 'control', 'danger', 'warning', 'success'].includes(value)
      }
    },

    /**
     * Icon size
     */
    size: {
      type: String,
      default: 'medium',
      validator (value) {
        return ['small', 'medium', 'large'].includes(value)
      }
    },

    /**
     * Icon css class
     */
    icon: {
      type: String,
      default: ''
    }
  }
}
</script>

<style>
  .u-icon{
    --hs: var(--hs-control);
    font-size: 20px;
    color: hsl(var(--hs), var(--l-state-default));
  }

  .u-icon_color-control{
    --hs: var(--hs-control);
  }

  .u-icon_color-primary{
    --hs: var(--hs-primary);
  }

  .u-icon_color-warning{
    --hs: var(--hs-warning);
  }

  .u-icon_color-danger{
    --hs: var(--hs-danger);
  }

  .u-icon_color-success{
    --hs: var(--hs-success);
  }

  .u-icon_size-small{
    font-size: 16px;
  }

  .u-icon_size-medium {
    font-size: 24px;
  }

  .u-icon_size-large {
    font-size: 36px;
  }
</style>

<docs>
### Colors

```vue
<template>
  <div>
    <h1>Default color is "control"</h1>
    <u-icon icon="el-icon-edit"/>
    <h2>Other colors</h2>
    <u-icon color="control" icon="el-icon-edit"/>
    <u-icon color="primary" icon="el-icon-edit"/>
    <u-icon color="success" icon="el-icon-edit"/>
    <u-icon color="warning" icon="el-icon-edit"/>
    <u-icon color="danger" icon="el-icon-edit"/>
  </div>
</template>
```

### Sizes

```vue
<template>
  <div>
    <u-icon size="small" icon="el-icon-edit"/>
    <u-icon size="medium" icon="el-icon-edit"/>
    <u-icon size="large" icon="el-icon-edit"/>
  </div>
</template>
```
</docs>
