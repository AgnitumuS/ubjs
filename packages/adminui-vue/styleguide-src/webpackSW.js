// webpack config for build service-worker
// run:
// webpack --config webpackSW.js
const path = require('path')
module.exports = {
  entry: path.resolve(__dirname, './sw.js'),
  output: {
    path: path.resolve(__dirname, '.'),
    filename: 'service-worker.min.js'
  }
}
