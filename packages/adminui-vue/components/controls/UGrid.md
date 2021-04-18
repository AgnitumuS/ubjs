### Basic usage

By default, UGrid align elements in 2 columns with `columnGap` (space between columns) of 20px and 0 `rowGap` (space between rows):

> default rowGap is 0 because in most case `UFormRow` (what have his own margins) is placed into cells (see below)

```vue
<template>
  <u-grid>
    <u-base-input :value="1"/>
    <textarea :value="2"/>
    <div>1-t column of 2-d row</div>
    <div>2-d column of <strong>2-d row</strong></div>
  </u-grid>
</template>
```

### Columns and provided props

UGrid provides a `label-position` `label-width` and `max-width` to child's UFormRow's.

Here we place labelled elements in **4-columns**, and provide a `label-position` to child's UFormRow's
```vue
<template>
  <u-grid :columns="4" label-position="top">
    <u-form-row label="Document #"><strong>{{docNum}}</strong></u-form-row>
    <u-form-row label="Created on"><strong>{{$UB.formatter.formatDate(docDate, 'date')}}</strong></u-form-row>
    <u-form-row label="Password"><u-base-input type="password" v-model="pwd"/></u-form-row>
    <u-form-row label="Password is"><u-base-input v-model="pwd"/></u-form-row>
  </u-grid>
</template>
<script>
  export default {
    data () {
      return {
        docNum: '2020-11',
        docDate: new Date('2021-01-12'),
        pwd: 'myPassword'
      }
    }
  }
</script>
```

### Template[Columns|Rows]

In simple case prop `columns` define N columns all with the same width and rows height is calculated based on cell content.

Using `template-columns` (see [grid-template-rows](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows) ) and
`template-rows` ( see [grid-template-rows](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows)) almost any layout can be created

In example below the second column occupy 200px and third - 30%, and the first all the available space.
First row take the height: auto and second will take the rest of the height

```vue
<template>
  <div style="height: 150px; width: 600px;">
    <u-grid
      template-columns="1fr 200px 30%"
      template-rows="auto 1fr"
      row-gap="10px"
    >
      <u-base-input :value="1"/>
      <u-base-input :value="2"/>
      <u-base-input :value="3"/>
      <textarea :value="4"/>
      <textarea :value="5"/>
      <textarea :value="6"/>
    </u-grid>
  </div>
</template>
```

### Gap
Gap between rows and columns can be defined using `column-gap` and `row-gap`.
See [grid-column-gap](https://developer.mozilla.org/en-US/docs/Web/CSS/column-gap) and [grid-row-gap](https://developer.mozilla.org/en-US/docs/Web/CSS/row-gap)
documentation.
```vue
<template>
  <u-grid
    column-gap="50px"
    row-gap="10px"
    :columns="3"
  >
    <u-base-input :value="1"/>
    <u-base-input :value="2"/>
    <u-base-input :value="3"/>
    <u-base-input :value="4"/>
    <u-base-input :value="5"/>
    <u-base-input :value="6"/>
    <u-base-input :value="7"/>
  </u-grid>
</template>
```