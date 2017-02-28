/**
 * UnityBase file-system based virtual store **select**. Able to load files & transform it content to {@link TubCachedData} format.
 *
 * Good sample of usage can be found in `ubm_form.loadAllForm`
 *
 * For work with data, loaded by FileBasedStoreLoader you can use {@link LocalDataStore} class.
 * @module FileBasedStoreLoader
 */

const lds = require('./LocalDataStore');
const path = require('path')
const UBDomain = require('./UBDomain')

module.exports = FileBasedStoreLoader;
/**
 * @example

    var loader = new FileBasedStoreLoader({
         entity: me.entity,
           foldersConfig: folders,
           fileMask: /-fm\.def$/,
           onBeforeRowAdd: postProcessing
        });
    resultDataCache = loader.load();

 * @class
 * @param {Object}    config
 * @param {TubEntity|UBEntity} config.entity
 * @param {Array.<{path: string}>} config.foldersConfig   Array of folder configuration to scan for files.
 *                                              Necessary param is path - path to folder. You can also pass additional information
 *                                              for use in  `onBeforeRowAdd` and `onNewFolder` callbacks.
 *                                              Currently processed root folder accessible from FileBasedStoreLoader.processingRootFolder
 * @param {Boolean}   config.zipToArray     Transform result from array of object to array-of-array representation. Default true
 * @param {Boolean}   config.uniqueID       Result data must contain ID attribute and values must be unique. Default true.
 * @param {RegExp}    [config.fileMask]     Regular expression to filter folder files. Each fileName (without path) will be tested by this regExp
 * @param {String}    [config.attributeRegExpString] String representation of regular expression to found attribute and it value in input content.
 *                                                   Default is '^\\/\\/@(\\w+)\\s"(.*?)"' what mean find all string like: //@attribute "value"
 *                                                   You can pass empty string to disable attribute parsing by regExp and do it manually in `onBeforeRowAdd` handler.
 * @param {Function}  [config.onBeforeRowAdd] Callback called for each row BEFORE it added to store. In case it return false row not added.
 *                          Called with args (this: FileBasedStoreLoader, fullFilePath: string, fileContent: string, oneRow: Object);
 * @param {Function}  [config.onNewFolder] Callback called for each new folder in case of recursive folder.
 *                          In case callback return false or not defined - folder not processed.
 *                          Called with args (this: FileBasedStoreLoader, fullFolderPath: string, recursionLevel: integer);
 */
function FileBasedStoreLoader(config) {
    var entityAttributes;
    if (config.entity instanceof UBDomain.UBEntity) {
      entityAttributes = config.entity.attributes
    } else {
      entityAttributes = App.domainInfo.get(config.entity.name).attributes
    }

    /**
     * Configuration
     * @type {Object}
     */
    this.config = _.clone(config);
    if (!Array.isArray(config.foldersConfig)){
        throw new Error('config.foldersConfig must be array');
    }
    if (config.attributeRegExpString !== '') {
        this.config.attributeRegExpString = config.attributeRegExpString || FileBasedStoreLoader.JSON_ATTRIBURE_REGEXP;
    }

    if (!this.config.hasOwnProperty('uniqueID')){ this.config.uniqueID = true; }
    if (!this.config.hasOwnProperty('zipToArray')){ this.config.zipToArray = true; }

    /**
     * Entity attributes array
     * @type {Array.<Object>}
     * @readonly
     */
    this.attributes = [];
    for (let attrName in entityAttributes) {
      let attr = entityAttributes[attrName]
      this.attributes.push({
            name: attr.name,
            dataType: attr.dataType,
            defaultValue: attr.defaultValue,
            defaultView: attr.defaultView
        });
    }
    /**
     * Is `mStore.simpleAudit` enabled for current entity (exist `mi_modifyDate` attribute)
     * @type {Boolean}
     * @readonly
     */
    this.haveModifyDate = Boolean(_.find(this.attributes, {name: 'mi_modifyDate'}));
    /**
     * Is `mStore.simpleAudit` enabled for current entity (exist `mi_createDate` attribute)
     * @type {Boolean}
     * @readonly
     */
    this.haveCreateDate = Boolean(_.find(this.attributes, {name: 'mi_createDate'}));

    /**
     * Currently processed root folder
     * @type {*}
     * @readonly
     */
    this.processingRootFolder = null;
}

FileBasedStoreLoader.JSON_ATTRIBURE_REGEXP = '^\\/\\/[ \t]?@(\\w+)\\s"(.*?)"';
FileBasedStoreLoader.XML_ATTRIBURE_REGEXP = '<!--@(\\w+)\\s*"(.+)"\\s*-->';

/**
 * Perform actual loading.
 * @return {TubCachedData}
 */
FileBasedStoreLoader.prototype.load = function(){
    var me = this,
        result;

    /**
     * Array of Object representing dirty result
     * @type {Array.<Object>}
     * @protected
     */
    this.resultCollection = [];
    me.config.foldersConfig.forEach(function(folderConfig){
        me.processingRootFolder = folderConfig;
        me.parseFolder(folderConfig.path, 0);
    });
    // transformation to array=of=array
    if (me.config.zipToArray){
        result = {
            data: [],
            fields: [],
            rowCount: 0
        };
        result.fields = _.map(me.attributes, 'name');
        result.data = lds.arrayOfObjectsToSelectResult(me.resultCollection, result.fields);
        result.rowCount = result.data.length;
    } else {
        result = me.resultCollection;
    }
    me.resultCollection = [];
    return result;
};

/**
 * @method parseFolder
 * @protected
 * @param {String} folderPath Folder to parse
 * @param {Number} recursionLevel current level of folder recursion
 */
FileBasedStoreLoader.prototype.parseFolder = function(folderPath, recursionLevel){
    var
        me = this,
        fs = require('fs'),
        config = me.config,
        folderFiles;

    if (!fs.existsSync(folderPath)) {
        return;
    }

    if (config.onNewFolder) {
        if (config.onNewFolder(me, folderPath, recursionLevel) === false) return;
    }
    folderFiles = fs.readdirSync(folderPath);

    folderFiles.forEach(function(fileName){
        var oneRow,
            fullPath = path.join(folderPath, fileName),
            stat = fs.statSync(fullPath),
            newFolderCheck, content, canAdd;

        if (stat.isDirectory()){
            if (config.onNewFolder){
                newFolderCheck = config.onNewFolder(me, folderPath + fileName, recursionLevel + 1);
                if (newFolderCheck !== false){
                    me.parseFolder(fullPath + '\\', recursionLevel + 1);
                }
            }
        } else if (!me.config.fileMask || me.config.fileMask.test(fileName)) { // filtration by mask
            content = fs.readFileSync(fullPath);
            oneRow = me.extractAttributesValues(content);

            if (me.haveModifyDate) {
                oneRow['mi_modifyDate'] = stat.mtime;
            }
            if (me.haveCreateDate) {
                oneRow['mi_createDate'] = stat.ctime;
            }
            canAdd = me.config.onBeforeRowAdd ? me.config.onBeforeRowAdd(me, fullPath, content, oneRow) : true;
            //check unique ID
            if (canAdd && config.uniqueID) {
                if (!oneRow.ID) {
                    console.error('Parameter ID not set. File "%" ignored', fullPath);
                    canAdd = false
                } else if (_.find(me.resultCollection, {ID: oneRow.ID})) {
                    console.error('Record with ID "' + oneRow.ID + '" already exist. File ignored ', fullPath);
                    canAdd = false
                }
            }
            if (canAdd) {
                me.resultCollection.push(oneRow);
            }
        }
    });
};

/**
 * Extract attribute values from content using regular expression passed in the config.attributeRegExpString.
 *
 * Convert values from string representation to JS data type using entity attribute dataType information
 *
 * Add default values for missed attributes
 *
 * @private
 * @param {String} content
 * @result {Object} dictionary looking like {attrbuteName: "value"}
 */
FileBasedStoreLoader.prototype.extractAttributesValues = function(content){
    var me = this,
        regexp = me.config.attributeRegExpString ? new RegExp(me.config.attributeRegExpString, 'gm') : false,
        attrVal, result = {};

    //extraction block
    if (regexp !== false) {
        attrVal = regexp.exec(content);
        while (attrVal !== null) {
            result[attrVal[1]] = attrVal[2];
            attrVal = regexp.exec(content);
        }
    }
    //default block
    me.attributes.forEach(function(attribute){
        if (attribute.defaultValue !== '' && !result[attribute.name]){
            result[attribute.name] = attribute.defaultValue;
        }
    });
    //transformation block
    _.forEach(result, function(value, attribute) {
        var attr = _.find(me.attributes, {name: attribute}),
            toType;
        if (!attr){ return; }
        switch (attr.dataType) {
            case UBDomain.ubDataTypes.Int:
            case UBDomain.ubDataTypes.BigInt:
            case UBDomain.ubDataTypes.ID:
            case UBDomain.ubDataTypes.Float:
            case UBDomain.ubDataTypes.Currency:
            case UBDomain.ubDataTypes.Entity:
            case UBDomain.ubDataTypes.TimeLog:
                result[attribute] = +value;
                break;
            case UBDomain.ubDataTypes.Boolean:
                result[attribute] = (value === true) || (value === 'true') || (value === '1');
                break;
            case UBDomain.ubDataTypes.DateTime:
                result[attribute] = _.isDate(value) ? value : new Date(value);
                break;
            case UBDomain.ubDataTypes.Unknown:
            case UBDomain.ubDataTypes.String:
            case UBDomain.ubDataTypes.Text:
            case UBDomain.ubDataTypes.Many:
            case UBDomain.ubDataTypes.Document:
            case UBDomain.ubDataTypes.Enum:
            case UBDomain.ubDataTypes.BLOB:
                break; // just to be sure we handle all types
            default:
                throw "Unknown attribute type " + toType;
        }
    });
    return result;
};