/**
 * @class UBReport
 * Report builder. Shared between client and server. Details see in {@link PDF.csPrintToPdf.writeHtml }
 *
 * Example usage on server side
 *
 *      var UBReport = require('@unitybase/ubs/public/UBReport.js');
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
 */
/*global require,TubDocumentRequest,TubLoadContentBody*/
(function(){
 function definition(Q, UB, Mustache){
     /**
      * @constructor
      * @param {String|Object} reportCode
      * If reportCode type is Object it is a config object { code: String, type: String, params: String|Object }
      * @param {String} [reportType='html'] Possible values: 'html'|'pdf'
      * @param {{}} params
      */
    function UBReport(reportCode, reportType, params){
        var me = this;
        /**
         * Report code
         * @property {String} reportCode
         */
        me.reportCode = reportCode;
         /**
          * Possible values: 'html', 'pdf'
          * @property {String} reportCode
          */
        me.reportType = reportType || 'html';
        /**
         * Report parameters
         * @property {{}} incomeParams
         */
        me.incomeParams = params || {};

         /**
          * The options of report. Known options: pageOrientation.
           *  @property {{}} reportOptions
          */
        me.reportOptions = {};

         if (typeof(reportCode) === 'object'){
             me.reportCode = reportCode.code;
             me.reportType = reportCode.type || 'html';
             me.incomeParams = reportCode.params;
             me.debug = reportCode.debug;
         }
    }

    var rp = UBReport.prototype;

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
    rp.init = function(){
        var me = this, reportRW, store, repository;
        if (me.isInited){
            return Q.resolve(true);
        }
        repository = UB.Repository('ubs_report').attrs(['ID','report_code','name','template', 'code', 'model'])
            .where('[report_code]', '=', me.reportCode );
        if (UB.isServer){
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
        } else {
            return repository.selectAsObject().then(function(store){
                me.reportRW = {
                    ID:  store[0].ID,
                    name: store[0].name,
                    template: store[0].template,
                    code: store[0].code,
                    model: store[0].model,
                    report_code: me.reportCode
                };

                return Q.all([me.getDocument('template'), me.getDocument('code')])
                    .then(function(res){
                        me.reportRW.templateData = res[0];
                        me.prepareTemplate();
                        me.reportRW.codeData = res[1];
                        me.prepareCode();
                        me.isInited = true;
                        return true;
                    });
            });
        }
    };

    rp.prepareTemplate = function(){
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
    rp.makeReport = function(params){
        var me = this, prm, reportData;

        prm = _.clone(me.incomeParams);
        if (params){
           prm = _.assign(prm, params);
        }
        if (UB.isServer){
            me.init();
            reportData = me.buildReport(prm);
            if (!Q.isPromise(reportData)){
                reportData = Q.resolve(reportData);
            }
            return reportData.then(function(data){
                return  me.makeResult(data);
            });
        } else {
            return me.init().then(function(){
                    return me.buildReport(prm);
            }).then(function(data){
                    return  me.makeResult(data);
            });
        }
    };

     /**
      * build HTML report
      * @param {Object} reportData
      * @returns {String}
     */
    rp.buildHTML = function(reportData){
        var me = this,
            rendered,
            userLang,
            _i18n, argv, session;
        if (!reportData || typeof(reportData) !== 'object' || reportData instanceof Array){
            throw new Error('reportData must have type Object');
        }
        //if(UB.isServer){
            //_i18n = require('../../../models/UB/i18n.js');
            //argv = require('./argv');
            //session = argv.establishConnectionFromCmdLineAttributes();
            //userLang = session.uData.lang || 'en';
        //}
        reportData = reportData || {};
        reportData.i18n = function(){
            if(UB.isServer){
                return function(word){
                    return UB.i18n(word, userLang);
                };
            } else {
                return UB.i18n;
            }
        };
        rendered = Mustache.render(me.reportRW.templateData, reportData);
        return rendered;
        /*
        if (me.reportType === 'html'){
            return rendered;
        } else {
            return me.makePdf(rendered);
        }
        */
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
    rp.transformToPdf =  function(html, options){
        var me = this, promise, pdf, pdfConfig;
        options = options || {};

        if (!PDF){
            throw new Error('Model PDF is not initialized.');
        }

        if(UB.isServer){
            promise = Q.resolve();
        } else {
            promise = PDF.init();
        }
        return promise.then(function(){
            return PDF.csPrintToPdf.requireFonts({
                fonts: options.fonts ? options.fonts : [
                    { fontName: "TimesNewRoman", fontStyle: "Normal" },
                    { fontName: 'TimesNewRoman', fontStyle: 'Bold'},
                    { fontName: 'TimesNewRoman', fontStyle: 'Italic'}
                ]
            });
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
    rp.makeResult = function(reportData){
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
    rp.prepareCode = function(){
        var me = this,
            exports = {};
            if (UB.isServer){
                var Module = require('module');
                var fileName = 'models/' + me.reportRW.model + '/public/reports/' + me.reportRW.report_code + '.js';
                fileName = Module._resolveFilename(fileName);
                var module = new Module.Module(fileName);
                Module._extensions['.js'](module, fileName);
                exports = module.exports;
            } else {
                if(me.reportRW.codeData && me.reportRW.codeData.length){
                /*jslint evil: true */
                 (new Function('exports', '// ' + me.reportCode + '\r\n' + me.reportRW.codeData
                 ))(exports);
                /*+ "\n//# sourceURL="+ me.reportRW.codeUrl + '.js' */
                /*jslint evil: false */
                } else {
                   throw new Error('Report code is invalid or empty. You should use code like: exports.reportCode={ prepareData:function }; ');
                }
            }


            if (exports.reportCode){
                _.forEach(exports.reportCode, function(item, name){
                    me[name] = item;
                });
                return;
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
     rp.buildReport = function(reportParams){
         throw new UB.UBError('Not defined function buildReport in report code block.  ');
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
    rp.getDocument  = function(attribute){
       var me = this,
           cfg = JSON.parse(me.reportRW[attribute]), method;
       if (!UB.isServer){
           var url = [$App.connection.baseURL , 'getDocument','?entity=ubs_report&attribute=', attribute,
               '&ID=', me.reportRW.ID];


           if(cfg.store){
                url.push('&store=', cfg.store);
           }
           if(cfg.filename){
                url.push('&filename=', cfg.filename);
           }
           if(cfg.origName){
                url.push('&origName=', cfg.origName);
           }
           if(cfg.isDirty){
                url.push('&isDirty=', cfg.isDirty);
           }
           if (me.debug){
               url.push('&dtrPrm=', (new Date()).getTime() );
           }
           url = url.join('');
           me.reportRW[attribute + 'Url'] = url;

           method = $App.connection.get;
           return method.call($App.connection, url, {responseType: "text"})
            .then(function(response){
                return response.data;
            });
            //    params.revision = val.revision;
       } else {
            var docReq = new TubDocumentRequest();
            docReq.entity = 'ubs_report';
            docReq.attribute = attribute;
            docReq.id = me.reportRW.ID;
            docReq.isDirty = !!cfg.isDirty;
            var docHandler = docReq.createHandlerObject(false);
            docHandler.loadContent(TubLoadContentBody.Yes /*WithBody*/);
            return docHandler.request.getBodyAsUnicodeString();
       }
    };

    return UBReport;
 } // end of definition function
    var Q, fUB, Mustache;
    //noinspection JSUnresolvedVariable
    if (typeof exports === 'object') {
        //noinspection JSUnresolvedFunction
        try{
            fUB = UB;
        }
        catch(err){
            fUB = require('UB');
        }
        if (!fUB.isServer){
            Q = require('q');
        } else {
            Q = require('when');
        }
        Mustache = require('mustache');
        module.exports = definition(Q, fUB, Mustache);
    } else { //noinspection JSUnresolvedVariable
        if (typeof define === 'function' && define.amd) {
            //noinspection JSUnresolvedFunction
            define(['q', 'UB', 'Mustache'], definition);
        } else {
            //noinspection JSUnresolvedVariable
            Q = window.Q;
            fUB = window.UB;
            Mustache = window.Mustache; // require('mustache');
            window.UBS.UBReport = definition(Q, fUB, Mustache);
        }
    }
})();