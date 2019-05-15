const Vue = require('vue')
const Vuex = require('vuex')
const instance = require('./instance')
const mountHelpers = require('./mount')
const processing = require('./processing')
const validation = require('./validation')

module.exports = {
  ...instance,
  mountHelpers,
  ...processing,
  ...validation,
  formBoilerplate
}

/**
 * Helper for all boilerplate functions which
 * @param  {Object}              options
 * @param  {Object}              options.params             ShowForm params
 * @param  {VueComponent}        options.FormComponent      Component which will be rendered
 * @param  {ClientRepository}        options.masterRequest      Request for master record
 * @param  {Array<ClientRepository>} options.collectionRequests Initialization for collection requests
 */
function formBoilerplate ({
  params,
  FormComponent: component,
  masterRequest,
  collectionRequests
}) {
  // will activate tab if form already mounted
  if (mountHelpers.activateIfMounted(params)) return

  const assignInstance = instance.createInstanceModule()
  const assignProcessing = processing.processingModule(assignInstance, masterRequest, collectionRequests)
  const store = new Vuex.Store(assignProcessing)
  const validator = validation.validateEntitySchema(store)

  store.dispatch('init', params.instanceID)
  const FormComponent = Vue.extend({
    mixins: [validation.validationInjectMixin],
    ...component
  })

  mountHelpers.mount({
    FormComponent,
    showFormParams: params,
    store,
    validator
  })
}
