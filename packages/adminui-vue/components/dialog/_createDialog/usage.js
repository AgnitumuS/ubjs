const createDialog = require('./createDialog')
const CustomTemplate = require('./CustomTemplate.vue').default

module.exports = async function (title) {
  const selectedDate = await createDialog(CustomTemplate, {
    externalTitle: title,
  }, {
    width: '800px'
  })

  doSmth(selectedDate)
}

function doSmth (res) {
  console.log('result is ', res)
}
