/** 
 * Fake vm
 * @module vm
 * @memberOf module:buildin
 */

const {runInThisContext, loadDll} = process.binding('modules');
/** 
 * Node expect this config
{
    filename: filename,
    lineOffset: 0,
    displayErrors: true
  }
 */
exports.runInThisContext = function(code, config){
  return runInThisContext(code, config.filename)
}
exports.runInDebugContext = function(){};