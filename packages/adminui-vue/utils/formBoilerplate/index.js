const Vue = require('vue')
const Vuex = require('vuex')
const instance = require('./instance')
const mount = require('./mount')
const processing = require('./processing')
const validation = require('./validation')

module.exports = {
  ...instance,
  ...mount,
  ...processing,
  ...validation,
  formBoilerplate
}

/**
 * Helper for all boilerplate functions which
 * @param  {Object}                  options
 * @param  {Object}                  options.params             ShowForm params
 * @param  {VueComponent}            options.FormComponent      Component which will be rendered
 * @param  {ClientRepository}        options.masterRequest      Request for master record
 * @param  {Array<ClientRepository>} options.collectionRequests Initialization for collection requests
 * @return {Promise.<VuexStore>}
 */
async function formBoilerplate ({
  params,
  FormComponent: component,
  masterRequest,
  collectionRequests
}) {
  // will activate tab if form already mounted
  if (mount.activateIfMounted(params)) return

  const assignInstance = instance.createInstanceModule(params.store)
  const assignProcessing = processing.processingModule(assignInstance, masterRequest, collectionRequests)
  const store = new Vuex.Store(assignProcessing)
  const validator = validation.validateEntitySchema(store)

  await store.dispatch('init', params.instanceID)
  const FormComponent = Vue.extend({
    mixins: [validation.validationInjectMixin],
    ...component
  })

  mount.mountForm({
    FormComponent,
    showFormParams: params,
    store,
    validator
  })

  return store
}
