module.exports = {
  getMSOfficeApp
}

/**
 * Return application for MSOffice environment to open specific file for editing
 * https://docs.microsoft.com/ru-ru/office/client-developer/office-uri-schemes
 *
 * @param {string} fileName of the attached file e.g. "Version 1.docx"
 * @returns {string}
 */
function getMSOfficeApp (fileName) {
  let MSOfficeApp = ''
  let fileExtension = fileName.split('.')
  fileExtension = fileExtension[fileExtension.length - 1]
  switch (fileExtension) {
    case 'docx':
    case 'doc':
    case 'docm':
    case 'dot':
    case 'dotx':
    case 'dotm':
      MSOfficeApp = 'ms-word:ofe|u|'
      break
    case 'xlsx':
    case 'xls':
    case 'xlt':
    case 'xlsm':
    case 'xltx':
    case 'xltm':
    case 'xlsb':
      MSOfficeApp = 'ms-excel:ofe|u|'
      break
    case 'ppt':
    case 'pptx':
    case 'pptm':
    case 'pot':
    case 'potx':
    case 'potm':
      MSOfficeApp = 'ms-powerpoint:ofe|u|'
      break
    case 'vsd':
    case 'vdx':
    case 'vsdx':
    case 'vsdm':
    case 'vstx':
    case 'vstm':
    case 'vssm':
    case 'vssx':
      MSOfficeApp = 'ms-visio:ofe|u|'
      break
    case 'mdb':
    case 'accdb':
    case 'accdt':
      MSOfficeApp = 'ms-access:ofe|u|'
      break
    case 'mpp':
      MSOfficeApp = 'ms-project:ofe|u|'
      break
    default:
      MSOfficeApp = null
  }
  return MSOfficeApp
}
