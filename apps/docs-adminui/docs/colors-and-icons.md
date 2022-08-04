## Colors
Colors are based on the hsl format (hue, saturation, lightness)

![hsl-color-wheel](img/hsl-color-wheel.png)

 - all variables consist of `hs + l` combination
 - `hs` is a color basis; `l` indicates how much color will be closer to black or white
 - for example, to get the color of success text what hovered:
```css
hsl(var(--hs-success), var(--l-state-default))
```

Tables below shows valid color combinations:

```[import](./ColorMatrix.vue)
```

## Customizing a color schema
All color related CSS variables are defined in the root scope and can be customized by application. 
Table below shows a default color variables values:
```css
:root {
 /* state colors */
  --hs-primary: 220, 80%;
  --hs-success: 120, 30%;
  --hs-warning: 20, 65%;
  --hs-danger: 360, 60%;

  /* Controls - buttons, icons etc. */
  --hs-control: 220, 15%;
  --l-state-default: 45%;
  --l-state-hover: 60%;
  --l-state-active: 35%;
  --l-state-disabled: 85%;

  /* text */
  --hs-text: 240, 5%;
  --l-text-default: 20%;
  --l-text-label: 45%;
  --l-text-description: 60%;
  --l-text-disabled: 80%;
  --l-text-inverse: 100%;

  /* border */
  --hs-border: 220, 20%;
  --l-input-border-default: 60%;
  --l-input-border-hover: 40%;
  --l-input-border-disabled: 75%;
  --l-layout-border-default: 70%;
  --l-layout-border-light: 90%;

  /* background */
  --hs-background: 220, 20%;
  --l-background-default: 95%;
  --l-background-active: 90%;
  --l-background-inverse: 100%;
}
```
> **Important** css variables don\'t affect the colors of the element-ui components

## Icons
AdminUI provides a three different sets of icons as an iconic font + css classes:
  - u-icon-*: a UnityBase icon set
  - el-icon-*: an ElementUI icon set, see [available ElementUI icons](https://element.eleme.io/#/en-US/component/icon)
  - fa*: a free subset of FontAwesome icon set, see [available Font Awesome icons](https://fontawesome.com/icons?d=gallery&p=2&m=free)

Below is a list of u-icons:
 
```vue
<template>
  <div>
    <u-form-row label="size">
      <el-select v-model="iconSize">
        <el-option
          v-for="size in sizes"
          :key="size"
          :value="size"
        />
      </el-select>
    </u-form-row>
     <div
      v-for="icon in allIcons"
      :key="icon"
      class="exmaple-icon"
    >
      <u-icon
        :size="iconSize"
        :icon="icon"
      /> {{ icon }}
    </div>        
  </div>
</template>

<script>
export default {
  data () {
    return {
      multipleFileExample: [],
      iconSize: 'medium',
      sizes: ['small', 'medium', 'large']
    }
  },
  computed: {
    allIcons () {
      const ubIcons = []
      for (const ss of document.styleSheets) {
        for (const r of ss.cssRules) {
          if (!r.selectorText) continue
          if (!r.selectorText.startsWith('.u-icon-')) continue
          const icon = r.selectorText.split(':')[0].substr(1)
          if (!ubIcons.includes(icon)) {
            ubIcons.push(icon)
          }
        }
      }
      return ubIcons
    } 
  }
}
</script>

<style>
  .exmaple-icon{
    width: 33%;
    display: inline-flex;
    align-items: center;
    padding-bottom: 10px;
  }

  .exmaple-icon .u-icon {
    margin-right: 8px;
  }
</style>
```

