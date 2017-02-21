/**
 * Server-side Report builder
 *
 * Example usage on server side
 *
 *      var UBReport = require('@unitybase/ubs/modules/UBServerReport');
 *      var report = UBReport.makeReport('test','pdf',{});
 *       report.done(function(result){
 *         toLog('done');
 *         var fs = require('fs');
 *         if (result.reportType === 'pdf'){
 *             toLog(result.reportData.byteLength);
 *             fs.writeFileSync('d:\\result.pdf', result.reportData );
 *         } else {
 *             toLog(result.reportData.length);
 *             fs.writeFileSync('d:\\result.html', result.reportData );
 *         }
 *      });
 *
 * @module @unitybase/ubs/modules/UBServerReport
 */
const Mustache = require('mustache')
const Q = require('when')

const xmldom = require('xmldom');
global.DOMParser = xmldom.DOMParser
global.XMLSerializer = xmldom.XMLSerializer

/**
* @constructor
* @param {String|Object} reportCode
* If reportCode type is Object it is a config object { code: String, type: String, params: String|Object }
* @param {String} [reportType='html'] Possible values: 'html'|'pdf'
* @param {{}} params
*/
function UBReport(reportCode, reportType, params){
  /**
   * Report code
   * @property {String} reportCode
   */
  this.reportCode = reportCode;
   /**
    * Possible values: 'html', 'pdf'
    * @property {String} reportCode
    */
  this.reportType = reportType || 'html';
  /**
   * Report parameters
   * @property {{}} incomeParams
   */
  this.incomeParams = params || {};

   /**
    * The options of report. Known options: pageOrientation.
     *  @property {{}} reportOptions
    */
  this.reportOptions = {};

   if (typeof(reportCode) === 'object'){
       this.reportCode = reportCode.code;
       this.reportType = reportCode.type || 'html';
       this.incomeParams = reportCode.params;
       this.debug = reportCode.debug;
   }
}

   /**
    * @returns {Promise|String} If code run in server function return report data as String else return Promise.
    * Promise.resolve function get parameter report data as String.
    */
  UBReport.makeReport = function(reportCode, reportType, params){
     var report = new UBReport(reportCode, reportType, params);
     return report.makeReport();
  };

   /**
    * Load report template and code.
    * @returns {Promise|Boolean}
    */
   UBReport.prototype.init = function(){
      var me = this, store, repository;
      repository = UB.Repository('ubs_report').attrs(['ID','report_code','name','template', 'code', 'model'])
          .where('[report_code]', '=', me.reportCode );

      store = repository.select();
      if (store.rowCount < 1){
          throw new Error(['Report with code "', me.reportCode, '" not found'].join(''));
      }
      me.reportRW = {
          ID:  parseInt(store.get(0), 10), //ID,
          name: store.get(2), //name,
          template: store.get(3), //template,
          code: store.get(4), //code,
          model: store.get(5),
          report_code: me.reportCode
      };
      //debugger;
      me.reportRW.templateData  = me.getDocument('template');
      me.prepareTemplate();
      // loaded in prepareCode me.reportRW.codeData =  me.getDocument('code');
      me.prepareCode();
      me.isInited = true;
      return Q.resolve(true);
  };

UBReport.prototype.prepareTemplate = function(){
      var me = this, matches, reOptions = /(<!--%\w+?:(.+?)-->)/gi;
      //<!--{{userrole}}-->
      me.reportRW.templateData = me.reportRW.templateData.replace(/<!--({{.+?}})-->/g, '$1');
      //<!--@name "123"-->
      me.reportRW.templateData = me.reportRW.templateData.replace(/<!--@\w+?[ ]*?".+?"-->/g, '');

      // parse options
      matches = me.reportRW.templateData.match(reOptions);
      if (matches && matches.length > 0){
          _.forEach(matches, function(item){
              var itemVal =  item.match(/<!--%(\w+?\:.+?)-->/)[1];
              itemVal = itemVal.split(':');
              me.reportOptions[itemVal[0]] = itemVal[1];
          });
          //value = value.replace(reOptions, '');
      }

  };

  /**
   * @param {{key: value}} [params]
   * @returns {Promise}
   * Promise resolve object {reportCode: {String}, reportType: {String}, incomeParams: {Object}, reportOptions: {Object}, reportData: {String|ArrayBuffer}}
       }.
   */
  UBReport.prototype.makeReport = function(params){
      var me = this, prm, reportData;

      prm = _.clone(me.incomeParams);
      if (params){
         prm = _.assign(prm, params);
      }
      me.init();
      reportData = me.buildReport(prm);
      if (!Q.isPromise(reportData)){
          reportData = Q.resolve(reportData);
      }
      return reportData.then(function(data){
          return  me.makeResult(data);
      });
  };

   /**
    * build HTML report
    * @param {Object} reportData
    * @returns {String}
   */
   UBReport.prototype.buildHTML = function(reportData){
      var me = this,
          rendered,
          userLang;
      if (!reportData || typeof(reportData) !== 'object' || reportData instanceof Array){
          throw new Error('reportData must have type Object');
      }
      reportData = reportData || {};
      reportData.i18n = function(){
          return function(word){
              return UB.i18n(word, userLang);
          };
      };
      rendered = Mustache.render(me.reportRW.templateData, reportData);
      return rendered;
  };


  /**
  * Prepare PDF report from html
  * @param {String} html
  * @param {Object} options
  * @param {Array|Object} [options.fonts]
   * [{ fontName: "TimesNewRoman", fontStyle: "Normal" }, ..]
  * @param {Boolean} [options.outputPdf] If it is not False build PDF output at end. By default it is True.
  * @returns {Promise} Promise resolve arrayBuffer with PDF or instance of PDF.csPrintToPdf with rendered HTML on it when options.outputPdf is false.
  */
  UBReport.prototype.transformToPdf =  function(html, options){
      var me = this, promise, pdf, pdfConfig;
      options = options || {};

      if (!PDF){
          throw new Error('Model PDF is not initialized.');
      }


      return PDF.csPrintToPdf.requireFonts({
          fonts: options.fonts ? options.fonts : [
              { fontName: "TimesNewRoman", fontStyle: "Normal" },
              { fontName: 'TimesNewRoman', fontStyle: 'Bold'},
              { fontName: 'TimesNewRoman', fontStyle: 'Italic'}
          ]
      }).then(function(){
          pdfConfig = {
              orientation: me.reportOptions.pageOrientation === 'landscape' ? 'l' : 'p',
              font: {
                  name: "TimesNewRoman",
                  type: "Normal",
                  size: 12
              },
              margin: {
                  top: 5,
                  right: 5,
                  bottom: 8,
                  left: 5
              }
          };
          if (me.onTransformConfig){
              pdfConfig = me.onTransformConfig(pdfConfig);
          }
          pdf = new PDF.csPrintToPdf(pdfConfig);
          pdf.writeHtml({
              html: html,
              orientation: me.reportOptions.pageOrientation,
              onPositionDetermine: options.onPositionDetermine
          });
          me.pdf = pdf;
          if (options.outputPdf === false ){
             return pdf;
          } else {
             return pdf.output('arrayBuffer').buffer;
          }
      });
  };



   /**
    *  @private
     * @param {ArrayBuffer|String} reportData
    * @returns {Object}
    */
   UBReport.prototype.makeResult = function(reportData){
       if (!reportData){
           throw new Error('Report ' + this.reportCode + ' return empty report');
       }
       return {
           reportCode: this.reportCode,
           reportType: this.reportType,
           incomeParams:this.incomeParams,
           reportOptions: this.reportOptions,
           reportData: reportData
       };
  };


   /**
    * Apply user code to itself
    * @private
    */
   UBReport.prototype.prepareCode = function(){
      var me = this,
          exports = {};

      var Module = require('module');
      var fileName = 'models/' + me.reportRW.model + '/public/reports/' + me.reportRW.report_code + '.js';
      fileName = Module._resolveFilename(fileName);
      var module = new Module.Module(fileName);
      Module._extensions['.js'](module, fileName);
      exports = module.exports;

      if (exports.reportCode){
          _.forEach(exports.reportCode, function(item, name){
              me[name] = item;
          });
      }
  };

   /**
    * This function must be defined in report code block.
    *
    * Inside function you must:
    *
    *  - Prepare data
    *  - Run method this.buildHTML(reportData); where reportData is data for mustache template
    *  - If need create PDF run method this.buildPdf(htmlReport); where htmlReport is HTML
    *  - If is server side function must return report as string otherwise Promise
    *
    * @cfg {function} buildReport
    * @param {Object} reportParams
    * @returns {Promise|Object|String} If code run at server, method must return report data, else - Promise, which resolves to report data
    */
   UBReport.prototype.buildReport = function(reportParams){
       throw new UB.UBError('Function "buildReport" not defined in report code block');
   };


   /**
    * This function used by ReportViewer.
    * If function exists and return UBS.ReportParamForm or Array ReportViewer show this panel on the top of viewer form.
    * Example
    *
    *      onParamPanelConfig: function() {
    *           var paramForm = Ext.create('UBS.ReportParamForm', {
    *           items: [{
    *                  xtype: 'textfield',
    *                  name: 'name',
    *                  fieldLabel: 'Name'
    *              }, {
    *                  xtype: 'datefield',
    *                  name: 'birthday',
    *                  fieldLabel: 'Birthday'
    *              }, ],
    *              getParameters: function(owner) {
    *                  var frm = owner.getForm();
    *                  return {
    *                      name: frm.findField('name').getValue(),
    *                      birthday: frm.findField('birthday').getValue()
    *                  };
    *              }
    *          });
    *          return paramForm;
    *      }
    *
    * or
    *
    *      onParamPanelConfig: function() {
    *           return [{
    *                  xtype: 'textfield',
    *                  name: 'name',
    *                  fieldLabel: 'Name'
    *              }, {
    *                  xtype: 'datefield',
    *                  name: 'birthday',
    *                  fieldLabel: 'Birthday'
    *              } ];
    *      }
    *
    *
    * @cfg {function} onParamPanelConfig
    */

   /**
    * You can edit config for pdf in this function
    *
    * @cfg {function} onTransformConfig
    * @param {Object} config
    * @returns {Object}
    */

   /**
    * load document
    * @param {String} attribute
    * @returns {Promise|Object}
    */
   UBReport.prototype.getDocument  = function(attribute){
     var me = this,
         cfg = JSON.parse(me.reportRW[attribute])

    var docReq = new TubDocumentRequest();
    docReq.entity = 'ubs_report';
    docReq.attribute = attribute;
    docReq.id = me.reportRW.ID;
    docReq.isDirty = !!cfg.isDirty;
    var docHandler = docReq.createHandlerObject(false);
    docHandler.loadContent(TubLoadContentBody.Yes /*WithBody*/);
    return docHandler.request.getBodyAsUnicodeString();
  };

module.exports = UBReport;
