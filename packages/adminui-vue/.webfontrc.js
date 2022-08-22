const path = require('path')
const dest = path.resolve(__dirname, './theme/icons')

module.exports = {
  dest,
  template: 'css',
  formats: ['woff2'],
  fontName: 'ub-icons',
  templateClassName: 'u',
  glyphTransformFn: icon => {
    // set u-icon in templateClassName to create a class .u-icon which override css in UIcon.vue
    icon.name = `icon-${icon.name}`
    return icon
  },
  normalize: true,
  preserveAspectRatio: true,
  fontHeight: 1001
}