if (!UB.isServer && window.XLSX === undefined ){
  if (!XLSX){
    /*jshint -W079 */
    var XLSX = {}
    /*jshint +W079 */
  }

  /**
   * load all need for XLSX and return promise
   * @returns promise
   */
  XLSX.init = function(){
    if (window.isDeveloperMode){
       XLSX.promise = System.import('@ub-e/xlsx-pub')
    } else {
        XLSX.promise = UB.inject('clientRequire/@ub-e/xlsx-pub/dist/xlsx-all.min.js')
    }
    return XLSX.promise
  }
} 
