module.exports = {
  addClickOutsideListener,
  removeClickOutsideListener
}

function addBodyListener () {
  document.body.addEventListener('click', (e) => {
    for (const listener of listeners) {
      listener.handler(e)
    }
  })
}

const listeners = []

let id = 0

/**
 * Adds listener which call 'hide' callback after click outside all refs
 *
 * @param {array<HTMLElement>} refs Array of dom elements a click on which will don't call 'hide'
 * @param {function} hide Callback on click outside refs
 * @return {number} Id of current listener. Use id for remove listener
 */
function addClickOutsideListener (refs, hide) {
  if (id === 0) {
    addBodyListener()
  }

  id++
  const listener = {
    id,
    handler (e) {
      const isTarget = refs.some(ref => {
        return ref && ref.contains(e.target)
      })

      if (!isTarget) {
        hide()
      }
    }
  }
  listeners.push(listener)
  return id
}

/**
 * Remove listener by id
 * @param {number} id Id
 */
function removeClickOutsideListener (id) {
  const listenerIndex = listeners.findIndex(l => l.id === id)
  if (listenerIndex !== -1) {
    listeners.splice(listenerIndex, 1)
  }
}
