const UB = require('@unitybase/ub-pub')

/**
 * Api to load files in UB
 */
class FileLoader {
  constructor (entity, attribute) {
    this.entity = entity
    this.attribute = attribute
  }

  /**
   * Download file to user PC
   *
   * @param {blob} file
   * @param {number} fileId
   * @returns {Promise<void>}
   */
  async saveAs (file, fileId) {
    const binaryFile = await this.downloadFile(file, fileId)
    window.saveAs(new Blob([binaryFile]), file.origName)
  }

  /**
   * Creates preview url
   *
   * @param {blob} file
   * @param {number} fileId
   * @returns {Promise<string>}
   */
  async getPreviewUrl (file, fileId) {
    const binaryFile = await this.downloadFile(file, fileId)
    return window.URL.createObjectURL(new Blob([binaryFile], { type: file.ct }))
  }

  /**
   * Returns binary file from UB
   *
   * @param {object} file
   * @param {number} fileId
   * @returns {Promise}
   */
  downloadFile (file, fileId) {
    return UB.connection.getDocument({
      entity: this.entity,
      attribute: this.attribute,
      id: fileId,
      isDirty: file.isDirty,
      _rc: file.revision
    }, { resultIsBinary: true })
  }

  /**
   * Load file into UB
   *
   * @param {blob} binaryFile
   * @param {number} fileId
   * @returns {Promise<string>} File attribute value
   */
  async uploadFile (binaryFile, fileId) {
    const resultData = await UB.connection.setDocument(binaryFile, {
      entity: this.entity,
      attribute: this.attribute,
      origName: binaryFile.name,
      id: fileId
    })

    return JSON.stringify(resultData)
  }
}

module.exports = FileLoader
