if (!UB.isServer && window.XLSX === undefined ){
    if (!XLSX){
       /*jshint -W079 */
       var XLSX = {};
       /*jshint +W079 */
    }

    /**
     * load all need for XLSX and return promise
     * @returns promise
     */
    XLSX.init = function(){
//           if (window.isDeveloperMode){
//              XLSX.promise = System.import('@ub-e/xlsx-pub')
// // Q.all([ UB.inject('models/XLSX/csBaseStyleElement.js')
// //                   ]).then(function(){
// //                           return Q.all([
// //                             UB.inject('models/XLSX/csStyleBorder.js'),
// //                             UB.inject('models/XLSX/csStyleFill.js'),
// //                             UB.inject('models/XLSX/csStyleFormat.js'),
// //                             UB.inject('models/XLSX/csStyleFont.js'),
// //                             UB.inject('models/XLSX/csStyleAlign.js'),
// //                             UB.inject('models/XLSX/csStyleProtect.js'),
// //                             UB.inject('models/XLSX/csWorksheet.js'),
// //                             UB.inject('models/XLSX/csWorkbook.js')
// //                         ]);
// //                   }).then(function(){
// //                           return UB.inject('models/XLSX/csStyle.js');
// //                   });
//           } else {
              XLSX.promise = UB.inject('clientRequire/@ub-e/xlsx-pub/dist/xlsx-all.min.js');
          // }
          return XLSX.promise;
    };
} 
