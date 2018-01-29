module.exports = {
  doFullSearch
}

let fuse
let index
function initIndex (shortcutsStore) {
  if (!fuse) {
    fuse = System.import('fuse.js')
  }
  return fuse.then(Fuse => {
    if (index) return index
    let options = {
      //id: 'ID',
      shouldSort: true,
      includeScore: true,
      threshold: 0.3,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        'code',
        'name',
        'description'
      ]
    }
    let data = []
    shortcutsStore.each((r) => {
      data.push({
        ID: r.get('ID'),
        iconCls: r.get('code'),
        code: r.get('code'),
        name: r.get('caption'),
        description: r.get('caption')
      })
      return true
    })
    index = new Fuse(data, options)
    return index
  })
}

function doFullSearch (shortcutsStore, val) {
  initIndex(shortcutsStore).then(index => {
    let found = index.search(val)
    console.log(found)
  })
}
