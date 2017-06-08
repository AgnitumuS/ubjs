function walk(el, searchCode, callback){
  if (el.valueBlock){ 
      if (el.valueBlock.toString() === searchCode ){ 
             callback(el);
             return false;
      } else {
        if ( Array.isArray(el.valueBlock.value)){
               return el.valueBlock.value.every(function(dt){
                   return walk(dt, searchCode, callback);                                 
               });
        }     
      }
  }
  return true;
}

var typeNames = {
  "2.5.4.10": "O",
"2.5.4.11": "OU",
"2.5.4.12": "T",
"2.5.4.3": "CN",
"2.5.4.4": "SN",
"2.5.4.42": "G",
"2.5.4.43": "I",
"2.5.4.5": "Serial",
"2.5.4.6": "C",
"2.5.4.7": "L",
"2.5.4.8": "S",
"2.5.4.9": "Street"
}

exports.formCode = {
    initUBComponent: function () {
        debugger;
        var me = this, uploadCertBtn, downloadCertBtn;
        if (me.parentContext.userID){
            me.getField('userID').hide();
            me.getField('userID').oldHidden = true;
        }
        uploadCertBtn = me.down('#uploadCertBtn');
        //return;
        uploadCertBtn.on('click', function uploadCertBtnClick() {
            Ext.create('UB.view.UploadFileAjax', {
                entityName: 'uba_usercertificate',
                scope: this,
                upLoad: function (btn) {
                    var
                        w = btn.up('window'), inputDom, params, ffile, pBar, waiterStarted = false, progressStarted = false;

                    inputDom = this.fieldFile.fileInputEl.dom; //getEl()
                    pBar = this.progressBar;

                    if (inputDom.files.length === 0) { // !form.isValid()
                        return;
                    }
                    btn.disable();
                    ffile = inputDom.files[0];

                    var rComplete = 0;
                    var reader = new FileReader();
                    reader.onloadend = function () {
                        var certBuff = reader.result; 
                        //debugger;
                        Q.all([
                         SystemJS.import( '/clientRequire/asn1js/build/asn1.js' ),
                         SystemJS.import( '/clientRequire/pkijs/build/Certificate.js' )])
                         .then(function(res){
                               var asn1js = res[0], Certificate = res[1].default;
                               var asn1 = asn1js.fromBER(certBuff);
                               // skip PrivateKeyUsagePeriod 2.5.29.16
                               walk(asn1.result, "2.5.29.16", function(el){
                                  console.log(el);
                                  el.valueBlock.value[2].valueDec = 64;
                                });                          
                               var certificate = new Certificate({ schema: asn1.result });
                                //var serial = certificate.subject.typesAndValues.find(function(el){ return el.type === "2.5.4.5" });
                                //serial = serial ? serial.value.valueBlock.value : ''; 
                                var subject = certificate.subject.typesAndValues.map(
                                  function(e){ return typeNames[e.type] + '=' + e.value.valueBlock.value; })
                                  .join(';');
                                var issuer = certificate.issuer.typesAndValues.map(
                                  function(e){ return typeNames[e.type] + '=' + e.value.valueBlock.value; })
                                issuer = issuer.join(';');
                                
                                var serial = '';
                                    (new Uint8Array(certificate.serialNumber.valueBlock.valueHex))
                                .forEach(function(e){ serial += parseInt(e).toString(16).toUpperCase();});
                                me.record.set('issuer_serial', issuer );
                                me.record.set('serial', serial );
                                me.record.set('description', subject );
                                rComplete++;
                                if (rComplete > 1){
                                  w.close();
                                }
                          });
                      
                    }
                    reader.readAsArrayBuffer(ffile);
                    
                    var reader1 = new FileReader();
                    reader1.onloadend = function () {
                        var certBase64 = reader1.result.split(',')[1];
                        me.addExtendedDataForSave({'certificate': certBase64});
                        me.updateActions();
                        rComplete++;
                        if (rComplete > 1){
                            w.close();
                        }
                        
                      
                        /*
                        $App.connection.pki().then(function(pkiInit){
                            return pkiInit.parseCertificate(certBase64);
                        }).done(function(certInfo){
                            if (certInfo.KeyUsage !== "ЕЦП, Неспростовність"){
                                throw new UB.UBError("Сертифікат повинен бути з призначенням ЕЦП.")
                            }
                            debugger;
                            me.record.set('issuer_serial', certInfo.Issuer );
                            me.record.set('serial', certInfo.Serial );
                            me.record.set('description', certInfo.Subj );
                        }); 
                        */
                    }  
                    reader1.readAsDataURL(ffile);
                    
                }
            });
        });
        downloadCertBtn = me.down('#downloadCertBtn');
        downloadCertBtn.on('click', function(){

                   $App.connection.query({
                       entity: 'uba_usercertificate',
                       method: 'getCertificate',
                       ID: me.record.get('ID') 
                   }).done(function(res){
                        var data = UB.LocalDataStore.selectResultToArrayOfObjects(res);
                        var blobData = new Blob(
                            [UB.base64toArrayBuffer(data[0].certificate)],
                            {type: 'application/x-x509-ca-cert'}
                        );
                        saveAs( blobData , me.record.get('serial') + '.cer') ;
                   });
        });
    }
};
