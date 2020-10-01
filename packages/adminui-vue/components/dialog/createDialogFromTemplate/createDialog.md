# Usage

Create dialog template:

`./CustomDialog.vue`
```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <u-date-picker v-model="someDate" />
    
    <u-button @click="done(someDate)" >
      ok
    </u-button>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    done: Function
  },

  data () {
    return {
      someDate: null
    }
  }
}
</script>
```

Use it as param of `createDialog`

```javascript
const {createDialog} = require('@unitybase/adminui-vue')
const CustomDialog = require('./CustomDialog.vue').default

const result = await createDialog(CustomDialog, {title: 'Date selection'})
// Promise will resolves when dialog will be closed or "done" function will called in template   
console.log(result) // selected date
```

## CustomDialog as render function

```javascript
const result = await createDialog(
  {
    props: {
      title: String,
      done: Function
    },
  
    data () {
      return {
        someDate: null
      }
    },
  
    render (h) {
      return h('div', [
        h('h1', this.title),
        h('u-date-picker', {
          props: {
            value: this.someDate
          },
          on: {
            input: value => { this.someDate = value }
          }
        }),
        h('u-button', {
          on: {
            click: () => this.done(this.someDate)
          }
        }, 'ok')
      ])
    }
  },
  { title: 'Date selection' }
)
// Promise will resolves when dialog will be closed or "done" function will called in template
console.log(result) // selected date
```
