/**
 * Created by xmax.
 */

var me = uba_usercertificate

function setBlob (ctxt) {
  var execParams = ctxt.mParams.execParams
  Object.keys(execParams)
  if (execParams.certificate) {
    var cert = Buffer.from(execParams.certificate) // 'base64'
    cert = cert.buffer.slice(cert.byteOffset, cert.byteOffset + cert.byteLength)
    execParams.setBLOBValue('certificate', cert) // base64
  }
}
me.on('insert:before', setBlob)
me.on('update:before', setBlob)

function clearBlob (ctxt) {
  var execParams = ctxt.mParams.execParams
  if (execParams.certificate) {
    execParams.certificate = ''
  }
}
me.on('insert:after', clearBlob)
me.on('update:after', clearBlob)

/*
 me.setCertificate = function(ctxt){
 var execParams = ctxt.mParams.execParams, storeCert, certParams;
 storeCert  = new TubDataStore('uba_usercertificate');
 certParams = new TubList();
 certParams.ID = execParams.ID;
 console.log(execParams.certificate);
 //certParams.setBLOBValue('certificate', Buffer.from(execParams.certificate, 'base64').buffer);
 certParams.setBLOBValue('certificate', Buffer.from(execParams.certificate).buffer);

 storeCert.run('update', {
 fieldList: ['ID'],
 "__skipOptimisticLock": true,
 execParams: certParams
 }
 );

 UB.Repository('uba_usercertificate').attrs(['ID', 'mi_modifyDate']).
 where('ID','=',execParams.ID).select(ctxt.dataStore);
 };

 me.entity.addMethod('setCertificate');
 */

me.getCertificate = function (ctxt) {
  var store = UB.Repository('uba_usercertificate').attrs(['ID', 'certificate'])
  .where('ID', '=', ctxt.mParams.ID).select()

  var certificate = store.getAsBuffer('certificate')
  certificate = new Buffer(certificate)
  certificate = certificate.toString('base64')
  // certificate = certificate.toString();
  ctxt.dataStore.initFromJSON({fieldCount: 1, values: ['certificate', certificate], rowCount: 1})
}

me.entity.addMethod('getCertificate')
