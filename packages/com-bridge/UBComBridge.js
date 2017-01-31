/**
 * Module for working with COM objects
 *
 * Usage sample:
 *
       const wdExportFormatPDF = 17 // PDF
       const COM = require('@unitybase/com-bridge')
       const path = require('path')
       const fullTestFilePath = path.join(__dirname, 'test-doc.docx')
       const fullPDFFilePath = path.join(__dirname, 'test-doc.pdf')

       const fs = require('fs')

       if (fs.existsSync(fullPDFFilePath)) fs.unlinkSync(fullPDFFilePath)

       let word = COM.createCOMObject('Word.Application')
       word.DisplayAlerts = 0
       word.CheckLanguage = false
       word.Options.CheckSpellingAsYouType = false

       let doc = word.Documents.Open(fullTestFilePath)

       doc.ExportAsFixedFormat({
        ExportFormat: wdExportFormatPDF,
        OutputFileName: fullPDFFilePath
      })
       doc.close({SaveChanges: false})
       doc = null
       word.Quit()
       word = null
 *
 * @module @unitybase/com-bridge
 */

const dllName = 'UBComBridge.dll'
const archPath = process.arch === 'x32' ? './bin/x32' : './bin/x64'
const path = require('path')
const moduleName = path.join(__dirname, archPath, dllName)
const binding = require(moduleName)
/**
 * Create new object - implementation of OLE object.
 *
 * Returning object has the same properties and methods like original COM object.
 * Names of methods and properties are case-insensitive. If com-object has get-properties with parameters
 * they implements in JS-object as functions.
 *
 * Method can take unnamed parameters(normal usage), you must use the correct order of the parameters,
 * or named parameters(in this case you use 1 object parameter with property name as parameter names and property values as parameter values)
 *
 * @param {String} objectName
 * @return {Object}
 */
module.exports.createCOMObject = binding.createCOMObject
