/*jshint multistr:true */
/*global TubAttrDataType, TubCacheType, TubDocumentRequest, TubLoadContentBody, ubs_report, require*/
var me = ubs_report;

var fs = require('fs'),
    FileBasedStoreLoader = require('@unitybase/base').FileBasedStoreLoader,
    LocalDataStore = require('@unitybase/base').LocalDataStore;

me.entity.addMethod('select');
me.entity.addMethod('update');
me.entity.addMethod('beforedelete');
me.entity.addMethod('insert');

/**
 *  here we store loaded forms
 */
var
    resultDataCache = null,
    modelLoadDate,
    TEMPLATE_CONTENT_TYPE =  'application/ubreport',
    CODE_BEHIND_CONTENT_TYPE =  'application/def',
    REL_PATH_TAIL = 'public\\reports\\',
    TEMPLATE_EXTENSION = '.template',
    CODE_BEHIND_EXTENSION  = '.js';

/**
 * Check integrity of file content. Passed as a callback to FileBasedStore.onBeforeRowAdd
 * @param {FileBasedStoreLoader} loader
 * @param {String} fullFilePath
 * @param {String} content
 * @param {Object} row
 * @return {boolean}
 */
function postProcessing(loader, fullFilePath, content, row){
    var parts, fileName, jsFilePath, jsFileStat,
        // we fill relPath in form "modelName"|"path inside model public folder" as expected by mdb virtual store
        relPath = loader.processingRootFolder.model.name + '|' + REL_PATH_TAIL;

    //fill model attribute by current folder model name
    row.model = loader.processingRootFolder.model.name;

    // fill name attribute with file name w/o ".xml" extension
    parts = fullFilePath.split('\\');
    fileName = parts[parts.length-1];
    row.report_code = fileName.substring(0, fileName.length - TEMPLATE_EXTENSION.length);

    // fill formDef attribute value
    row.template = JSON.stringify({
        fName: fileName,
        origName: fileName,
        ct: TEMPLATE_CONTENT_TYPE,
        size: content.length,
        md5: "fakemd50000000000000000000000000",
        relPath: relPath
    });


    fileName = fileName.substring(0, fileName.length - TEMPLATE_EXTENSION.length) + CODE_BEHIND_EXTENSION;
    parts[parts.length-1] = fileName;
    jsFilePath = parts.join('\\');
    jsFileStat = fs.statSync(jsFilePath);
    if (jsFileStat){ // file exists
        row.code = JSON.stringify({
            fName: fileName,
            origName: fileName,
            ct: CODE_BEHIND_CONTENT_TYPE,
            size: jsFileStat.size,
            md5: "fakemd50000000000000000000000000",
            relPath: relPath
        });
        // check js file modification and if later when def file - replace mi_modifyDate
        if (loader.haveModifyDate && row.mi_modifyDate < jsFileStat.mtime){
            row.mi_modifyDate = jsFileStat.mtime;
        }/*
        if (row.code){
           var cm = row.code.match(/\/\/@report_code "(.*)"/);
           if (cm && cm.length > 1){
               row.report_code = cm[1];
           }
        }  */

    }

    return true;
}

function loadAll(){
    var models = App.domain.config.models,
        folders = [],
        model, mPath, i, l,
        modelLastDate = new Date(App.globalCacheGet('UB_STATIC.modelsModifyDate')).getTime();

    console.debug('modelLastDate = ', modelLastDate);
    if (!resultDataCache || modelLoadDate < modelLastDate){
        console.debug('load reports from models directory structure');

        resultDataCache = [];
        for (i = 0, l = models.count; i < l; i++) {
            model = models.items[i];
            mPath = model.path + REL_PATH_TAIL;
            folders.push({
                path: mPath,
                model: model // used for fill Document content for `mdb` store in postProcessing
            });
        }
        var loader = new FileBasedStoreLoader({
            entity: me.entity,
            foldersConfig: folders,
            fileMask: new RegExp(TEMPLATE_EXTENSION + '$'),
            attributeRegExpString: FileBasedStoreLoader.XML_ATTRIBURE_REGEXP,
            onBeforeRowAdd: postProcessing
        });
        resultDataCache = loader.load();

        resultDataCache.version = 0;
        l = resultDataCache.fields.indexOf('mi_modifyDate');
        if (l !== -1){
            resultDataCache.data.forEach(function(row){
                if (resultDataCache.version < row[l]){
                    resultDataCache.version = row[l];
                }
            });
            resultDataCache.version = new Date(resultDataCache.version).getTime();
        }
        modelLoadDate = modelLastDate;
    }else{
        console.debug('ubs_report: resultDataCache already loaded');
    }
    return resultDataCache;
}

/** Retrieve data from resultDataCache and init ctxt.dataStore
 *  caller MUST set dataStore.currentDataName before call doSelect function
 * @param {ubMethodParams} ctxt
 */
function doSelect(ctxt){
    var
        mP = ctxt.mParams,
        aID = mP.ID,
        cachedData, filteredData,
        resp, cType = ctxt.dataStore.entity.cacheType,
        reqVersion;

    cachedData = loadAll();

    if (!(aID && (aID > -1)) && (cType === TubCacheType.Entity || cType === TubCacheType.SessionEntity) && (!mP.skipCache)){
        reqVersion = mP.version;
        mP.version = resultDataCache.version;
        if (reqVersion === resultDataCache.version){
            mP.resultData = {};
            mP.resultData.notModified = true;
            return;
        }
    }
    filteredData = LocalDataStore.doFilterAndSort(cachedData, mP);
    // return as asked in fieldList using compact format  {fieldCount: 2, rowCount: 2, values: ["ID", "name", 1, "ss", 2, "dfd"]}
    resp = LocalDataStore.flatten(mP.fieldList, filteredData.resultData);
    ctxt.dataStore.initFromJSON(resp);
}

/**
 *
 * @param {ubMethodParams} ctxt
 * @return {Boolean}
 */
me.select = function(ctxt) {
    ctxt.dataStore.currentDataName = 'select'; //TODO надо или нет????
    doSelect(ctxt);
    ctxt.preventDefault();
    return true; // everything is OK
};

/**
 * Check model exists
 * @param {Number} aID
 * @param {String} modelName
 */
function validateInput(aID, modelName){
    var model = App.domain.config.models.byName(modelName);
    if (!model) {
        throw new Error('ubs_report: Invalid model attribute value "' + modelName + '". Model not exist in domain');
    }

    if (!aID){
        throw new Error('No ID parameter passed in execParams');
    }
}

/**
 *
 * @param {ubMethodParams} ctxt
 * @param {Object} storedValue
 * @return {boolean}
 */
function doUpdateInsert(ctxt, storedValue, isInsert){
    var
        mP = ctxt.mParams,
        newValues,
        newDocument,
        ID, nDoc,
        docHandler, docReq, ct, docBody, attr, attrName, tmp, j, attrCnt,
        entity = me.entity,
        attributes = entity.attributes;

    newValues = mP.execParams || {};
    ID = newValues.ID;

    // move all attributes from execParams to storedValue
    _.forEach(newValues, function(val, key){
        attr = attributes.byName(key);
        if ( attr && (attr.dataType !== TubAttrDataType.Document) )  {
            storedValue[key] = val;
        }
    });

    newDocument = newValues.template;
    if (newDocument){
        nDoc = JSON.parse(newDocument);
    }
    docReq = new TubDocumentRequest();
    docReq.entity = entity.name;
    docReq.attribute = 'template';
    docReq.id = ID;
    docReq.isDirty =  nDoc ? !!nDoc.isDirty: (isInsert? true: false); //Boolean(!newDocument);
    docHandler = docReq.createHandlerObject(false);
    docHandler.loadContent(TubLoadContentBody.Yes /*WithBody*/);
    docBody = docHandler.request.getBodyAsUnicodeString();
    if (docBody){
        var clearAttrReg = new RegExp(FileBasedStoreLoader.XML_ATTRIBURE_REGEXP, 'gm'); // seek for <!--@attr "bla bla"-->CRLF
        //docBody = '<!--@ID "' + ID + '"-->\r\n' + docBody.replace(clearAttrReg, ''); // remove all old entity attributes
        docBody = docBody.replace(clearAttrReg, '');
    }
    for (j = 0, attrCnt = attributes.count; j<attrCnt; j++){
        attr = attributes.items[j];
        attrName = attr.name;
        if( attr.dataType !== TubAttrDataType.Document && (attr.defaultView || attrName==='ID')){
            docBody = '<!--@' + attrName + ' "' + storedValue[attrName] + '"-->\r\n' + docBody;
        }
    }
    docHandler.request.setBodyAsUnicodeString(docBody);

    ct = docHandler.content;
    ct.fName = storedValue.report_code + TEMPLATE_EXTENSION;
    ct.relPath = storedValue.model + '|' + REL_PATH_TAIL;
    ct.ct = TEMPLATE_CONTENT_TYPE;
    docReq.isDirty = true;
    docHandler.saveContentToTempStore();
    docHandler.moveToPermanentStore('');
    storedValue.template = JSON.stringify(ct);


    newDocument = newValues.code;
    if (newDocument){
        nDoc = JSON.parse(newDocument);
    }
    docReq = new TubDocumentRequest();
    docReq.entity = entity.name;
    docReq.attribute = 'code';
    docReq.id = ID;
    // if passed new form definition - load from temp store, else - from permanent
    docReq.isDirty = !!newDocument; // !!newDocument Boolean(newDocument);
    docHandler = docReq.createHandlerObject(false);
    docHandler.loadContent(TubLoadContentBody.Yes /*with body */);
    docBody = docHandler.request.getBodyAsUnicodeString();
    if ((!docBody || docBody === '{}') && newDocument === undefined){
        docBody = '\r\nexports.reportCode = {\r\n'+
        '/**\r\n'+
        '* This function must be defined in report code block.\r\n'+
        '*\r\n'+
        '* Inside function you must:\r\n'+
        '* 1) Prepare data\r\n'+
        '* 2) Run method this.buildHTML(reportData); where reportData is data for mustache template\r\n'+
        '* 3) If need create PDF run method this.transformToPdf(htmlReport); where htmlReport is HTML\r\n'+
        '* 4) If is server side function must return report as string otherwise Promise or string \r\n'+
        '*\r\n'+
        '* @cfg {function} buildReport\r\n'+
        '* @params {[]|{}} reportParams\r\n'+
        '* @returns {Promise|Object} If code run on server method must return report data.\r\n'+
        '* Promise object must resolve report code\r\n'+
        '*/\r\n'+
        'buildReport: function(reportParams){\r\n'+
        '  var me = this,\r\n'+
        '      result = me.buildHTML(reportParams);\r\n'+
        '   if (me.reportType === \'pdf\') {\r\n'+
        '      result = me.transformToPdf(result);\r\n'+
        '  }\r\n'+
        '  return result;\r\n'+
        '}\r\n};\r\n';
    }

    /*
    for (j = 0, attrCnt = attributes.count; j<attrCnt; j++){
        attr = attributes.items[j];
        attrName = attr.name;
        if( attr.dataType !== TubAttrDataType.Document && (attr.defaultView || attrName==='ID')){
            docBody = '//@' + attrName +  '"' + storedValue[attrName] + '"\r\n' + docBody;
        }
    }
    docBody = '//@! "do not remove comments below unless you know what you do!"\r\n' + docBody;
    */
    docHandler.request.setBodyAsUnicodeString(docBody);
    ct = docHandler.content;
    ct.fName = storedValue.report_code + CODE_BEHIND_EXTENSION;
    ct.relPath = storedValue.model + '|' + REL_PATH_TAIL;
    ct.ct = CODE_BEHIND_CONTENT_TYPE;
    storedValue.code = JSON.stringify(ct);

    docHandler.saveContentToTempStore();
    docHandler.moveToPermanentStore('');

    resultDataCache = null; // drop cache. afterInsert call select and restore cache
    return true;
}

/**
 *
 * @param {ubMethodParams} ctxt
 * @return {boolean}
 */
me.update = function(ctxt) {
    var
        inParams = ctxt.mParams.execParams || {},
        ID = inParams.ID,
        storedValue,
        cachedData;

    cachedData = loadAll();
    storedValue = LocalDataStore.byID(cachedData, ID);
    if (storedValue.total !== 1){
        throw new Error('Record with ID=' + ID + 'not found');
    }
    storedValue = LocalDataStore.selectResultToArrayOfObjects(storedValue)[0];

    validateInput(ID, inParams.model || storedValue.model);

    doUpdateInsert(ctxt, storedValue);

    ctxt.preventDefault();
    return true; // everything is OK
};

me.beforedelete = function() {
    throw new Error('<<<To delete Report you must manually delete corresponding xml file from model/Report folder!>>>');
};

/**
 * Check ID is unique and perform insertion
 * @param {ubMethodParams} ctxt
 * @return {boolean}
 */
me.insert = function(ctxt) {
    var
        inParams = ctxt.mParams.execParams,
        ID = inParams.ID,
        cachedData, row,
        oldValue = {};

    cachedData = loadAll();
    validateInput(ID, inParams.model);

    row = LocalDataStore.byID(cachedData, ID);
    if (row.total) {
        throw new Error('Report with ID ' + ID + 'already exist');
    }

    doUpdateInsert(ctxt, oldValue, true);
    ctxt.preventDefault();
    return true; // everything is OK
};
