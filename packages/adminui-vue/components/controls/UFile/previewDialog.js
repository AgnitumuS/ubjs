const UB = require('@unitybase/ub-pub')
const Vue = require('vue')
const Dialog = require('element-ui').Dialog

/**
 * Creates dialog, appends it to body and display image or pdf inside itself.
 *
 * @param {object} params
 * @param {string} params.entity Entity name that stores file
 * @param {string} params.attribute Attribute in entity that stores file
 * @param {number} params.id ID of record that stores file
 * @param {boolean} params.isDirty Whether file is already saved in record
 * @param {string} params.ct Content type of loaded file
 * @param {string} [params.revision] Current revision number of content
 */
module.exports = async function ({ entity, attribute, id, isDirty, ct, origName, revision }) {
  const binaryFile = await UB.connection.getDocument({
    entity,
    attribute,
    id,
    isDirty,
    _rc: revision
  }, { resultIsBinary: true })

  const previewUrl = window.URL.createObjectURL(new Blob([binaryFile], { type: ct }))

  const instance = new Vue({
    data () {
      return {
        dialogVisible: false
      }
    },
    render (h) {
      const iframe = h('iframe', {
        attrs: {
          frameborder: 0,
          width: '100%',
          height: '100%',
          src: previewUrl
        }
      })

      const img = h('img', {
        style: {
          margin: 'auto',
          display: 'block'
        },
        attrs: {
          height: '100%',
          src: previewUrl
        }
      })

      const content = ct === 'application/pdf' ? iframe : img

      return h(Dialog, {
        ref: 'dialog',
        class: 'u-file__preview-dialog',
        props: {
          width: '80vw',
          title: origName,
          visible: this.dialogVisible
        },
        on: {
          closed: () => {
            window.URL.revokeObjectURL(previewUrl)
            this.$destroy()
          },
          'update:visible': (val) => {
            this.dialogVisible = val
          }
        }
      }, [content])
    }
  })
  instance.$mount()
  document.body.appendChild(instance.$el)
  instance.dialogVisible = true
}
