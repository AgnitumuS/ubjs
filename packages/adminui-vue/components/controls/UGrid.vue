<template>
  <div
    class="u-grid"
    :style="{
      'display': 'grid',
      'grid-template-columns': gridTemplateColumns,
      'grid-template-rows': templateRows,
      'grid-column-gap': columnGap,
      'grid-row-gap': rowGap
    }"
  >
    <slot />
  </div>
</template>

<script>
/**
 * Container for align form elements into columns. Wrapper for a [display: grid CSS](https://css-tricks.com/snippets/css/complete-guide-grid/).
 */
export default {
  name: 'UGrid',

  props: {
    /**
     * Align controls into **N** equal columns. A wrapper for `repeat(**columns**, 1fr)`
     * Ignored if `templateColumns` is define.
     */
    columns: {
      type: Number,
      default: 2
    },

    /**
     * Sets a [grid-template-columns](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns)
     */
    templateColumns: String,

    /**
     * Sets a [grid-template-rows](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows)
     */
    templateRows: String,

    /**
     * Sets a [grid-column-gap](https://developer.mozilla.org/en-US/docs/Web/CSS/column-gap)
     */
    columnGap: {
      type: String,
      default: '20px'
    },

    /**
     * Sets a (grid-row-gap)[https://developer.mozilla.org/en-US/docs/Web/CSS/row-gap]
     */
    rowGap: String,

    /**
     * Set label width to child `<u-form-row>`'s
     * Can be override by same prop in `u-form-row`.
     * Will ignored with labelPosition === 'top'
     */
    labelWidth: {
      type: Number
    },
    /**
     * Set label position of child `<u-form-row>`'s
     * Can be override by the same prop in `u-form-row`
     */
    labelPosition: {
      type: String,
      validator: (value) => ['left', 'right', 'top'].includes(value)
    },

    /**
     * Provides a max width in px to the child UFormRow's.
     * Do not confuse with the maximum width of the form itself
     */
    maxWidth: Number
  },

  inject: {
    parentLabelWidth: { from: 'labelWidth', default: null },
    parentLabelPosition: { from: 'labelPosition', default: null },
    parentMaxWidth: { from: 'maxWidth', default: null }
  },

  provide () {
    return {
      labelWidth: this.labelWidth || this.parentLabelWidth,
      labelPosition: this.labelPosition || this.parentLabelPosition,
      maxWidth: this.maxWidth || this.parentMaxWidth
    }
  },

  computed: {
    gridTemplateColumns () {
      if (this.templateColumns) {
        return this.templateColumns
      } else {
        return `repeat(${this.columns}, 1fr)`
      }
    }
  }
}
</script>

<style>
  .u-grid {
    display: grid;
  }

  @media (max-width: 960px) {
    .u-grid {
      grid-template-columns: 1fr !important;
    }
  }
</style>

<docs>
### Basic usage

Place elements in 2 columns

```vue
<template>
  <u-grid>
    <el-input :value="1"/>
    <el-input :value="2"/>
  </u-grid>
</template>
```

### Columns

Place elements in **N-columns**
```vue
<template>
  <u-grid :columns="4">
    <el-input :value="1"/>
    <el-input :value="2"/>
    <el-input :value="3"/>
    <el-input :value="4"/>
  </u-grid>
</template>
```

### Template[Columns|Rows]

In this example, the second column will occupy 200px, the third - 30%, and the first all the available space.
Rows will be distributed as follows - the first row will take the height: auto, the second will take the rest of the height

```vue
<template>
  <div style="height: 150px; width: 600px;">
    <u-grid
      template-columns="1fr 200px 30%"
      template-rows="auto 1fr"
    >
      <el-input :value="1"/>
      <el-input :value="2"/>
      <el-input :value="3"/>
      <textarea style="height: 100%" :value="4"/>
      <textarea style="height: 100%" :value="5"/>
      <textarea style="height: 100%" :value="6"/>
    </u-grid>
  </div>
</template>
```

### Gap

By default `columnGap === 20px` and `rowGap === undefined`,
because usually rows gaps are replaces by UFormRow margins.

In example below will sets all gaps to **50px**
```vue
<template>
  <u-grid
    column-gap="50px"
    row-gap="50px"
    :columns="3"
  >
    <el-input :value="1"/>
    <el-input :value="2"/>
    <el-input :value="3"/>
    <el-input :value="4"/>
    <el-input :value="5"/>
    <el-input :value="6"/>
    <el-input :value="7"/>
    <el-input :value="8"/>
  </u-grid>
</template>
```
</docs>
