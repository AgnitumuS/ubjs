const createDialog = require('./create')
const CustomTemplate = require('./CustomTemplate.vue').default

module.exports = async function () {
  const payload = await createDialog(CustomTemplate, {
    props: {
      dateFrom: new Date()
    }
  })

  doSmth(payload)
}

function doSmth () {}
