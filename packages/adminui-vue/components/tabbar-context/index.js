const Template = require('./template.vue')

module.exports = ({x,y}) => {
  const Confirm = Vue.extend(Template)
  let resolveConfirm
  const promise = new Promise(resolve => {
    resolveConfirm = resolve
  })

  const instance = new Confirm({
    el: document.createElement('div'),
    data(){
      return { 
        visible: false,
        x,
        y
      }
    },
    
    methods: {
      resolveConfirm
    }
  })

  document.body.appendChild(instance.$el)
  instance.$nextTick(() => {
    instance.visible = true
  })

  return promise
}