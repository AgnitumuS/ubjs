const UB = require('@unitybase/ub')
/* global cdn_person */
// eslint-disable-next-line camelcase
const me = cdn_person
me.on('insert:before', checkPhotoIsJpeg)
me.on('update:before', checkPhotoIsJpeg)

/**
 * Check mime type of uploaded photo is in mimeTypes array
 * @method checkPhotoMimeType
 * @memberOf cdn_person_ns.prototype
 * @memberOfModule @unitybase/cdn
 * @param {ubMethodParams} ctxt
 * @param {Array<string>} mimeTypes
 */
me.checkPhotoMimeType = function (ctxt, mimeTypes) {
  const photo = ctxt.mParams.execParams.photo
  if (!photo) return
  const photoObj = JSON.parse(photo)
  const contentType = photoObj.ct
  if (!photoObj.deleting && (mimeTypes.indexOf(contentType) === -1)) {
    throw new UB.UBAbort(
      UB.format(UB.i18n('errNotSupportedFileType'), contentType, mimeTypes.join(','))
    )
  }
}

const POSSIBLE_PHOTO_MIMES = ['application/jpg', 'image/jpeg']
/**
 * @private
 * @param {ubMethodParams} ctx
 * @return {Boolean}
 */
function checkPhotoIsJpeg (ctx) {
  this.checkPhotoMimeType(ctx, POSSIBLE_PHOTO_MIMES)
  return true
}
