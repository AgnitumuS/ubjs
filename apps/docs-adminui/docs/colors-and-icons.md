## Colors
Colors are based on the hsl format (hue, saturation, lightness) <br>
All variables consist of hs + l combinations.<br>
hs - the basis of color <br>
l - indicates how much color will be closer to black or white <br>
Each color has its own modifiers. <br>
For example, to get the "success-hover" combination, you need to use them like this: <br>

![hsl-color-wheel](/docs/hsl-color-wheel.png)

### **Important** css variables don\'n affect the colors of the element-ui components 

```[import](./ColorMatrix.vue)
```

```css
hsl(var(--hs-success), var(--l-state-default))
```

Colors can combined just inside own block. <br>
For example text **HS** can combined just with text **L**

```css
hsl(var(--hs-text), var(--l-text-description))
```

or border can combine only with border lightness modifiers
```css
hsl(var(--hs-border), var(--l-layout-border-default))
hsl(var(--hs-border), var(--l-input-border-disabled))
hsl(var(--hs-border), var(--l-input-border-hover))
```

But each section **HS** can replaced by state colors
for example if need primary border
```css
hsl(var(--hs-primary), var(--l-input-border-default))
```

or danger button
```css
hsl(var(--hs-danger), var(--l-state-default))
hsl(var(--hs-danger), var(--l-state-hover))
```

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
  --l-layout-border-default: 80%;
  --l-layout-border-light: 90%;

  /* background */
  --hs-background: 220, 20%;
  --l-background-default: 95%;
  --l-background-active: 90%;
  --l-background-inverse: 100%;
}
```

## Icons
Icons below is an iconic font and set of a css classes what can be used anywhere, for example 

 - `<i class="u-icon-save"/>`
 - `<u-button icon="u-icon-save"/>`
 - `<u-icon icon="u-icon-save"/>`
 
Available icons:
 
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

