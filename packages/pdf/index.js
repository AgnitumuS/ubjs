﻿// ./jsPDF/adler32cs.js,./jsPDF/zlib.js,
// ./jsPDF/png.js,./jsPDF/Deflater.js,./jsPDF/jsPDF.js,
// ./jsPDF/jspdf.plugin.standard_fonts_metrics.js,./jsPDF/jspdf.plugin.split_text_to_size.js,./jsPDF/jspdf.unicodeText.js,
// ./jsPDF/jspdf.plugin.addimage.js,./jsPDF/jspdf.plugin.png_support.js

const jsPDF = require('./libs/jsPDF/jspdf.js')
let to = (typeof window === 'undefined') ? global : window
to.jsPDF = jsPDF
require('./libs/jsPDF/plugins/standard_fonts_metrics')
require('./libs/jsPDF/plugins/split_text_to_size')
require('./libs/jsPDF/plugins/addimage')
require('./libs/jsPDF/plugins/png_support')

require('./plugins/unicode-text')

jsPDF.adler32cs = require('adler32cs')
require('./libs/jsPDF/libs/deflate')
require('./libs/jsPDF/libs/png_support/png')
const zlib = require('./libs/jsPDF/libs/png_support/zlib')
to.DecodeStream = zlib.DecodeStream
to.FlateStream = zlib.FlateStream

const PrintToPdf = require('./src/PrintToPdf')

module.exports = {
  PrintToPdf: PrintToPdf,
  jsPDF: jsPDF
}
