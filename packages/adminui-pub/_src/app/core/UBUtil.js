/**
 * Файл: UB.core.UBUtil.js
 * Автор: Игорь Ноженко
 * 
 * Общефункциональные системные функции
 */

Ext.define("UB.core.UBUtil", {
    singleton: true,

    requires: [
        "UB.core.UBAppConfig"
    ],

    /**
     * Dictionary of system glyph for font icons. Values is a number or FontAwesome character
     * @property glyphs
     */
    glyphs: {
        faBars: 0xf0c9,
        faFilter: 0xf0b0,
        faRefresh: 0xf021,
        faEdit: 0xf044,
        faPlusCircle: 0xf055,   // add
        faTrashO: 0xf014, // delete
        faEye: 0xf06e,  // showPreview
        faLink: 0xf0c1,
        faSitemap: 0xf0e8, // details
        faCheck: 0xf00c,    // select
        faShareSquare: 0xf045, // save and close
        faFloppy: 0xf0c7,  // save
        faExternalLink: 0xf08e, // export
        faUp: 0xf062,
        faDown: 0xf063,
        faEllipsish: 0xf141, // ...
        faSearch: 0xf002,
        faQuestionCircle: 0xf059,
        faWrench: 0xf0ad,
        faSave: 0xf0c7,
        faOpen: 0xf115,
        faSquare: 0xf096,
        faBinoculars: 0xf002,//MPV - replace to search 0xf1e5,
        faClose: 0xf00d,
        faEraser: 0xf12d, //clear value
        faDownload: 0xf019,
        faUpload: 0xf093,
        faCalculator: 0xf1ec,
        faLock: 0xf023,
        faUnLock: 0xf09c,
        faCog: 0xf013,
        faCogs: 0xf085,
        faShare: 0xf064,
        faShareAlt: 0xf1e0,
        faUsers:  0xf0c0,
        faKey: 0xf084,
        faLanguage: 0xf1ab,
        faDatabase: 0xf1c0,
        faSignOut: 0xf08b,
        faPencil: 0xf040, //edit
        faTable: 0xf0ce, //grid (table, dictionary)
        faEnvelopeO: 0xf003,
        faEnvelope: 0xf0e0,
        faBell: 0xf0f3,
        faCaretDown: 0xf0d7,
        faFolder: 0xf07b,
        faHierarche: 0xf0e8,
        faPencilSquareO: 0xf044,
        faArrowLeft: 0xf060,
        faTimes: 0xf00d // CLOSE action
    },

    /**
     * 
     * @return {String[]}
     */
    getLocalStorageKeys: function() {
        var
            keys = [];

        if(window.localStorage){
            for(var i=0, len=localStorage.length; i<len; ++i){
                keys.push(localStorage.key(i));
            }
        }

        return keys;
    },

    /**
     * 
     * @param {String} key
     * @return {String}
     */
    getLocalStorageItem: function(key) {
        var
            data;

        if(window.localStorage){
            data = localStorage.getItem(key);
        }

        return data;
    },

    /**
     * 
     * @param {String} key
     * @param {String} data
     */
    setLocalStorageItem: function(key, data) {
        if(window.localStorage){
            localStorage.setItem(key, data);
        }
    },

    /**
     * 
     * @param {String} key
     */
    removeLocalStorageItem: function(key) {
        if(window.localStorage){
            localStorage.removeItem(key);
        }
    },

    /**
     *  Clear local storage
     */
    clearLocalStorage: function() {
        if(window.localStorage){
            localStorage.clear();
        }
    },

    /**
     * 
     * @param {String/Array} val
     * @return {String}
     */
    enclosedInBrackets: function(val) {
        if(Ext.isArray(val)){
            val = val.join(',');
        }

        return typeof val === "string" ? val.replace(/\b([^,]+)\b([,]*)/g, "[$1]$2") : val;
    },

    /**
     * 
     * @param {String/Array} val
     * @return {String}
     */
    extractfromBrackets: function(val) {
        if(Ext.isArray(val)){
            val = val.join(',');
        }

        return typeof val === "string" ? val.replace(/\[([^\]]*?)\]/g, "$1") : val;
    },

    /**
     * 
     * @param {String} val
     * @return {String}
     */
    removeWhitespaces: function(val) {
        return typeof val === "string" ? val.replace(/\s/g, "") : val;
    },

    /**
     * 
     * @param {String} strBegin
     * @param {String} strEnd
     * @param {String} [separator] (optional)
     * @return {String}
     */
    gatherStr: function(strBegin, separator, strEnd) {
        strBegin = strBegin || '';
        separator = separator || '';
        strEnd = strEnd || '';

        if(!strBegin.length){
            return strEnd;
        }
        else if(!strEnd.length){
            return strBegin;
        }
        else {
            return strBegin + separator + strEnd;
        }
    },

    /**
     * 
     * @return {Number}
     */
    getWindowHeight: function() {
        return (window.innerHeight ? window.innerHeight :
            (document.documentElement && document.documentElement.clientHeight ? document.documentElement.clientHeight :
                (document.body.clientHeight ? document.body.clientHeight : 400))) - 200 ;
    },

    /**
     * 
     * @return {Number}
     */
    getWindowWidth: function() {
        return (window.innerWidth ? window.innerWidth :
            (document.documentElement && document.documentElement.clientWidth ? document.documentElement.clientWidth :
                (document.body.clientWidth ? document.body.clientWidth : 800))) - 200;
    },

    /**
     * 
     * @param {Object} objLeft
     * @param {Object} objRight
     * @return {Boolean}
     */
    allPropsEqual: function(objLeft, objRight) {
        for(var p in objRight) {
            if(objRight.hasOwnProperty(p) && (objLeft[p] !== objRight[p])){
                return false;
            }
        }
        return true;
    },

    /**
     * @param {String} name
     * @param {String|String[]|Object} [more] (optional)
     * @return {String}
     */
    getNameMd5: function(name, more) {
        var
            param,
            addStr = '',
            strEnd;

        if(arguments.length === 0){
            return undefined;
        }


        name = arguments[0];
        for(var i=1, len=arguments.length; i<len; ++i){
            param = arguments[i];
            strEnd = Ext.isArray(param) ? param.join(',') : (Ext.isObject(param) ? Ext.JSON.encode(param) : param);
            addStr = this.gatherStr(addStr, '_', strEnd);

        }

        return this.gatherStr(name, '_', addStr && addStr.length ? UB.MD5(addStr).toString() : '');
    },

    getNameMd5WithSuffix: function() {
        if(arguments.length < 3){
            return undefined;
        }

        return this.getNameMd5.apply(this, [this.gatherStr(arguments[0], '_', arguments[1])].concat(Ext.Array.toArray(arguments,2)));
    },

    /**
     * 
     * @param {String} str
     * @param {RegExp} regexp
     * @param {Number} groupNo
     * @return {String}
     */
    getRegExpGroup: function(str, regexp, groupNo) {
        var
            m = regexp.exec(str);

        return m && m.length>groupNo ? m[groupNo] : undefined;
    },

    /**
     * 
     * @param {Array} array
     * @param {Function} fn
     * @return {Number}
     */
    findIndexByFn: function(array, fn) {
        for(var i=0, len=array.length; i<len; ++i){
            if(fn(array[i])){
                return i;
            }
        }

        return -1;
    },

    /**
     * 
     * @param {Object[]} array
     * @param {String} propertyName
     * @param {Boolean|Number|String} propertyValue
     * @return {Number}
     */
    findIndexByPropertyValue: function(array, propertyName, propertyValue) {
        return this.findIndexByFn(array, function(item) {
            return item[propertyName] === propertyValue;
        });
    },

    /**
     * 
     * @param {Object[]} array
     * @param {String} propertyName
     * @param {Boolean/Number/String} propertyValue
     * @return {Object}
     */
    getByPropertyValue: function(array, propertyName, propertyValue) {
        var
            result,
            idx;

        if((idx=this.findIndexByPropertyValue(array, propertyName, propertyValue)) !== -1){
            result = array[idx];
        }

        return result;
    },

    /**
     * 
     * @param {String/Object} src
     * @param {String} propertyName
     * @return {Array/Boolean/Date/Function/Number/Object/RegExp/String}
     */
    getProperty: function(src, propertyName) {
        var
            tmpObj = Ext.isString(src) ? Ext.JSON.decode(src, true) : src;

        return tmpObj ? tmpObj[propertyName] : undefined;
    },

    /**
     * 
     * @param {Array[Array]} data
     * @param {Number} valueIdx
     * @param {Boolean/Date/Number/String} value
     * @return {Array}
     */
    getFromArrayByValue: function(data, valueIdx, value) {
        var _data_;
        for(var i=0, len=data.length; i<len; ++i){
            _data_= data[i];
            if( valueIdx < _data_.length && this.isEqual(_data_[valueIdx], value)){
                return _data_;
            }
        }

        return undefined;
    },

    /**
     * Checks if two values are equal, taking into account certain
     * special factors, for example dates.
     * @param {Object} a The first value
     * @param {Object} b The second value
     * @return {Boolean} True if the values are equal
     */ 
    isEqual: function(a, b){
        if (Ext.isDate(a) && Ext.isDate(b)){
            return Ext.Date.isEqual(a, b);
        }

        return a === b;
    },

    /**
     * 
     * @param {String|Date} value
     * @return {Date}
     */
    dateISO8601Parse: function(value) {
        var
            result;
        return Ext.isDate(value) ? value : (!isNaN(result=Date.parse(value)) ? new Date(result) : null);
    },

    /**
     * 
     * @param {String[]} arr
     * @param {String} prefix
     * @param {String} separator (optional)
     * @return {String[]}
     */
    addPrefix: function(arr, prefix, separator) {
        var
            result = [];

        if(!Ext.isArray(arr)){
            return result;
        }

        for(var i = 0, len = arr.length; i < len; ++i){
            result.push(this.gatherStr(prefix, separator, arr[i]));
        }

        return result;
    },

    /**
     * 
     * @param {Object} l
     * @param {Object} r
     * @return {Boolean}
     */
    isObjectEqual: function(l, r) {
        var
            p,
            result = false;

        if(l === undefined && r === undefined){
            return true;
        }

        if(Ext.isObject(l) && Ext.isObject(r))
        {
            if(l === r){
                return true;
            }

            result = true;
            for( p in l){
                if (l.hasOwnProperty(p)){

                    if(_.isFunction(l[p]) && _.isFunction(r[p]) &&
                        this.removeWhitespaces(l[p].toString()) === this.removeWhitespaces(r[p].toString())){
                        continue;
                    }

                    if(Ext.isDate(l[p]) && Ext.isDate(r[p]) && Ext.Date.isEqual(l[p], r[p])){
                        continue;
                    }

                    if(l[p] === r[p]){
                        continue;
                    }

                    if(Ext.isArray(l[p]) && Ext.isArray(r[p]) && this.isArrayEqual(l[p], r[p])){
                        continue;
                    }

                    if(Ext.isObject(l[p]) && Ext.isObject(r[p]) && arguments.callee(l[p], r[p])){
                        continue;
                    }

                    result = false;
                } else {
                    return false;
                }
            }

            for(p in r){
                if( !l.hasOwnProperty(p)){
                    return false;
                }
            }
        }

        return result;
    },

    /**
     * 
     * @param {Array} l
     * @param {Array} r
     * @return {Boolean}
     */
    isArrayEqual: function(l, r) {
        var
            len,
            result = false;

        if(l === undefined && r === undefined){
            return true;
        }

        if(_.isArray(l) && _.isArray(r) && (len=l.length)===r.length){
            result = true;
            for(var i=0; i<len; ++i)
            {
                if(_.isFunction(l[i]) && _.isFunction(r[i]) &&
                    this.removeWhitespaces(l[i].toString()) === this.removeWhitespaces(r[i].toString())){
                    continue;
                }

                if(Ext.isDate(l[i]) && Ext.isDate(r[i]) && Ext.Date.isEqual(l[i], r[i])){
                    continue;
                }

                if(l[i] === r[i]){
                    continue;
                }

                if(_.isArray(l[i]) && _.isArray(r[i]) && arguments.callee(l[i], r[i])){
                    continue;
                }

                if(Ext.isObject(l[i]) && Ext.isObject(r[i]) && this.isObjectEqual(l[i], r[i])){
                    continue;
                }

                result = false;
            }
        }

        return result;
    },

    /**
     * 
     * @param {Ext.data.Store} store
     * @param {String[]} fields
     * @return {Array[]}
     */
    getArrayData: function(store, fields) {
        var
            data = [],
            i,
            len = fields.length;

        store.each(function(record) {
            var
                recordData = [];

            for(i=0; i<len; ++i){
                recordData.push(record.get(fields[i]));
            }

            data.push(recordData);
        });

        return data;
    },

    base64String: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",

    base64fromArrayBuffer:  function () {
        throw new Error('UB.core.UBUtil.base64fromArrayBuffer deprecated. Use UB.base64fromArrayBuffer');
    },

    /**
     *
     * @param {String} base64
     * @returns {Array}
     */
    base64toArrayOfFloats: function( base64 ) {
        var arrayBuffer = this.toArrayBuffer( base64 );
        var floatArray = new Float32Array( arrayBuffer );

        var arrayOfFloats = [];
        for( var i = 0, il = floatArray.length; i < il; i ++ ) {
            arrayOfFloats.push( floatArray[i] );
        }

        return arrayOfFloats;
   },

    /**
     *
      * @param {Date} value
     * @returns {Date}
     */
   truncTimeToUtcNull: function(value){
       if (!value){
           return value;
       }
       var result = new Date(value.getFullYear(),value.getMonth(),value.getDate());
       result.setMinutes(-value.getTimezoneOffset());
       return result;
   },

    truncTime: function(value){
        if (!value){
            return value;
        }
        var result = new Date(value.getFullYear(),value.getMonth(),value.getDate());
        return result;
    },

    /**
     *
     * @param {Date} inDate
     * @param {Number} countDay
     * @returns {Date}
     */
    addDays: function(inDate, countDay){
        if (!inDate){
            return inDate;
        }
        var result = new Date();
        result.setTime(inDate.getTime() );
        result.setDate(inDate.getDate() + countDay );
        return result;
    },



    /**
     * convert date to UB format
      * @param {Date} value
     * @param {String} dataType
     * @returns {Date}
     */
   convertDate : function(value, dataType){
        if (!value || !Ext.isDate(value)){
            return value;
        }
        if (dataType === UBDomain.ubDataTypes.Date){
            return UB.core.UBUtil.truncTimeToUtcNull(value);
        }
        return value;
   },

    /**
     *
     * @param {String} text
     * @returns {String}
     */
    escapeForRegexp: function(text) {
        if (text && Ext.isString(text) ){
           return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        } else {
            return '';
        }
    },
    /**
	 * Takes fieldList configuratiuon and prerare it to using in query to DB
     * @param {Array<String|Object>} fieldList
     * @param {Boolean} [onlyVisibleFields] return only visible (field.visibility !== false) fields. Default False mean return all
     * @returns {Array<String>} fieldList
     * */
    convertFieldListToNameList: function(fieldList, onlyVisibleFields){
        var result = [];
        _.forEach(fieldList, function(item){
            if (typeof item === "string"){
                result.push(item)
            } else if (!onlyVisibleFields || (onlyVisibleFields && item.visibility !== false)){
                result.push(item.name)
            }
        });
        return result;
    },
    /**
	 * Takes fieldList configuratiuon and prerare it to drawing in grid
     * @param {Array<String|Object>} fieldList
     * @returns {Array<Object>} fieldList
     * */
    convertFieldListToExtended: function(fieldList){
        return Ext.Array.map(fieldList, function(field){
            if(typeof field === "string"){
                return {name: field};
            }else {
                return field;
            }
        });
    },

    /**
     * db nabe to Camel case
     * @param dbName
     * @returns {*}
     */
    dbNameCamelCase:  function(dbName){
        var arrNames, i, name;
        if(!dbName) {
            return dbName;
        }
        arrNames = dbName.toLowerCase().split('_');
        for(i = 1; i < arrNames.length; i++){
            name = arrNames[i];
            if (name && name.length > 0){
                arrNames[i] = name[0].toUpperCase() + name.substr(1);

            }
        }
        return arrNames.join('');
    },

    /**
     * Create {@link Ext.Component#Configs } configuration based on entity attribute defenition
     * @param {String|UBEntity} entityName
     * @param {Object} attributeDefinition
     * @return {Object}
     */
    attribute2cmpConfig: function(entityName, attributeDefinition) {
        var
            cmpConfig,
            entity, attribute;

        if (typeof(entityName) === 'string') {
            entity = $App.domainInfo.get(entityName);
        } else {
            entity = entityName;
        }

        attribute = entity.attr(attributeDefinition.attributeName);
        if(attribute){
            cmpConfig = this.ubDt2Ext(attribute, attributeDefinition);
            cmpConfig.name = attributeDefinition.attributeName;
            cmpConfig.fieldLabel = attribute.caption || attributeDefinition.attributeName;
            if ( Ext.isDefined(attribute.isMultiLang) ){
                cmpConfig.isMultiLang = attribute.isMultiLang;
            }
            if(Ext.isDefined(attribute.allowNull) ){
                cmpConfig.allowBlank = attribute.allowNull;
            }
            cmpConfig.entityName = entity.code;
        }

        return cmpConfig;
    },

    /**
     * @param {UBEntityAttribute} attribute
     * @return {Object} {@link Ext.Component#configs}
     * @private
     */
    ubDt2Ext: function(attribute, attributeDefinition) {
        var
            ext,
            associatedEntityDisplayField,
            fieldListExist = Ext.isArray(attributeDefinition.fieldList) && (attributeDefinition.fieldList.length > 0),
            ubDataTypes = UBDomain.ubDataTypes,
            fieldList, whereList, orderList;

        switch(attribute.dataType){
            case ubDataTypes.Enum:
                ext = this.getComponentConfig4Enum(attribute.enumGroup, attributeDefinition);
                break;
            case ubDataTypes.Entity:
                ext = this.getComponentConfig4Entity(attribute.associatedEntity, attributeDefinition);
                break;
            case ubDataTypes.Many:
                associatedEntityDisplayField = fieldListExist ? attributeDefinition.fieldList[0] : $App.domainInfo.get(attribute.associatedEntity).getDescriptionAttribute();
                fieldList = ['ID'].concat(fieldListExist ? attributeDefinition.fieldList : [associatedEntityDisplayField]);
                whereList = attributeDefinition ? attributeDefinition.whereList : undefined;
                fieldList = (attributeDefinition ? attributeDefinition.fieldList : null) || fieldList;
                orderList = (attributeDefinition ? attributeDefinition.orderList : undefined) ||
                {"_asc": {expression: associatedEntityDisplayField, order: UB.core.UBCommand.order.sqlotAsc}};

                ext = {
                    xtype: "ubboxselect",//"comboboxselect"
                    store: Ext.create("UB.ux.data.UBStore", {
                        ubRequest: {
                            entity: attribute.associatedEntity,
                            method: 'select',
                            fieldList: fieldList,
                            orderList: orderList,
                            whereList: whereList
                        },
                        autoLoad: false,
                        autoDestroy: true
                    }),
                    valueField: 'ID',
                    displayField: associatedEntityDisplayField,
                    queryMode: 'remote',
                    editable: true,
                    forceSelection: true,
                    grow: false
                };
                break;
            case ubDataTypes.Document:
                ext = { xtype: 'ubdocument' };
                if (attribute.documentMIME){
                    ext.documentMIME = attribute.documentMIME;
                }
                break;
            case ubDataTypes.Text:
                ext = { xtype: 'textareafield' };
                break;
            case ubDataTypes.Date:
                ext = { xtype: 'ubdatefield', fieldType: ubDataTypes.Date, format: Ext.util.Format.dateFormat };
                break;
            case ubDataTypes.DateTime:
                ext = { xtype: 'ubdatetimefield', fieldType: ubDataTypes.DateTime /*, format: Ext.util.Format.date Format */};
                break;
            case ubDataTypes.Currency:
                ext = { xtype: 'numberfield',
                    maxLength:17, enforceMaxLength : true,
                    validator: function(val){
                        if (Number(val.replace(/[^0-9]/,'')) < 8999000000000000){
                            var rv = val.match(/[0-9]*[^0-9]{1}([0-9]+)/);
                            if ((rv && rv.length > 1 && rv[1].length < 3) || !rv || rv.length === 1){
                                return true;
                            }
                        }
                        return UB.i18n('numberOfSignificantDigits');
                    },
                    maxValue: 8999000000000000, minValue: -8999000000000000};
                break;
            default:
                ext = this.getComponentConfigByDataType(attribute.dataType, attribute.size);
                break;
        }
        //ext.labelAlign = 'right';
        return ext;
    },


    /**
     * create component config by data type
     * @param {String} dataType
     * @param {Number} [size] (optional) in case dataType = String - length of attribute
     */
    getComponentConfigByDataType: function(dataType, size){
        var
            configs = {
                'int': { xtype: 'numberfield', allowDecimals: false, hideTrigger: true },
                'float': { xtype: 'numberfield' },
                'date': { xtype: 'ubdatefield', format: Ext.util.Format.dateFormat },
                'boolean': {xtype: 'checkboxfield'},
                'string': {xtype: 'ubtextfield', enforceMaxLength: true}
            },
            physicalType = UBDomain.getPhysicalDataType(dataType),
            config = configs[physicalType] || { xtype: 'ubtextfield' };

        if(physicalType === 'string' ){
            config =  size > 256 ? { xtype: 'ubtextareafield', rows: 3 } : { xtype: 'ubtextfield' };
            if(size){
                Ext.apply(config, {
                    maxLength: size,
                    enforceMaxLength: true
                });
            }
        }

        return config;
    },

    /**
     * Create combobox config for entity
     * Example:
     *  pvdCombo = Ext.widget( Ext.apply(UB.core.UBDomainManager.getComponentConfig4Entity('tri_pvd'), {fieldLabel: 'ПВД', labelAlign: 'right'}));
     *  frm = Ext.create('Ext.window.Window', {items: [pvdCombo]});
     *
     * @param {String|UBEntity} entityCode
     * @param {Object} config
     * @param {Array} [config.fieldList=["ID", entity.descriptionAttribute]] field list for combobox store
     * @param {Object} [config.whereList] where list for combobox store
     * @param {String} [config.attributeName] in case component created from entity attribute - attribute code
     * @param {Object} [config.orderList] Custom order list for combo. By default combo sorted by first attribute (usually this is description attribute)
     */
    getComponentConfig4Entity: function(entityCode, config){
        var
            res, entity,
            whereList = config ? config.whereList : undefined,
            fieldList = config ? config.fieldList : null,
            orderList = config ? config.orderList : undefined;

        if (typeof(entityCode) === 'string') {
            entity = $App.domainInfo.get(entityCode);
        } else {
            entity = entityCode;
        }

        fieldList = fieldList || [entity.getDescriptionAttribute()];
        if (fieldList.indexOf('ID') < 0){
            fieldList = ['ID'].concat(fieldList);
        }
        res = {
            xtype: 'ubcombobox',
            store: Ext.create('UB.ux.data.UBStore', {
                ubRequest: {
                    entity: entity.code,
                    method: UB.core.UBCommand.methodName.SELECT,
                    fieldList: fieldList,
                    whereList: whereList,
                    orderList: orderList || {_asc: {expression: fieldList[1], order: UB.core.UBCommand.order.sqlotAsc}}
                },
                autoLoad: false,
                autoDestroy: true
            }),
            valueField: 'ID',
            displayField: fieldList[1],
            fieldList: fieldList,
            entityName: entity.code
        };

        return res;
    },

    /**
     * Create combobox config for enum
     * @param enumGroup
     * @param {Object} config
     * @param {Array} config.filters Array of filter for enum store
     * @return {Object}
     *
     */
    getComponentConfig4Enum: function(enumGroup, config){
        var
        //enumCfg = UB.core.UBAppConfig.systemEntities._enum_,
        //filters = config ? config.filters : [],
            store,
            whereList = config && config.whereList ? config.whereList: {},
            orderList = config && config.orderList ? config.orderList: {byName: {expression: "name", order: "asc"}};

        whereList.enumGroupFilter = {
            expression: '[eGroup]',
            condition: 'equal',
            values: {eGroup: enumGroup }
        };

        store = Ext.create('UB.ux.data.UBStore', {
            ubRequest: {
                entity: 'ubm_enum',
                method: UB.core.UBCommand.methodName.SELECT,
                fieldList: (config && config.fieldList) ? config.fieldList : ['eGroup','code','name','shortName','sortOrder'],
                whereList: whereList,
                orderList: orderList,
                idProperty: 'code'
            },
            disablePaging: true,
            autoLoad: false,
            autoDestroy: true
        });
        store.load();
        /*
         store = UB.core.UBEnumManager.getUBStore(enumGroup);
         if (filters.length > 0){
         store.filter(filters);
         }
         */
        return {
            //xtype: 'ubbasebox',
            xtype: 'ubbasebox', //combobox ubcombobox
            disableContextMenu: true,
            //store: store,
            store: store,
            valueField: 'code',
            displayField: 'name',
            queryMode: "local",
            editable: false,
            forceSelection: true,
            grow: false
        };
    },

    /**
     *
     * @param {String} entityName
     * @return {Object}
     */
    getEntityAttributesTree: function(entityName) {
        var entity = $App.domainInfo.get(entityName);
        return entity ? {
            leaf: false,
            id: entityName,
            expanded: true,
            text: entity.caption || entityName,
            children: UB.core.UBUtil.getEntityAttributesTreeData(entity, '', 1)
        } : undefined;
    },

    /**
     *
     * @param {String|UBEntity} entityName
     * @param {String} parentEntityName
     * @return {Array}
     */
    getEntityAttributesTreeData: function(entityName, parentEntityName, level) {
        var
            data = [],
            node, entity,
            Entity = UBDomain.ubDataTypes.Entity;

        if (typeof(entityName) === 'string') {
            entity = $App.domainInfo.get(entityName);
        } else {
            entity = entityName;
        }


        if(!entity){
            return data;
        }
        if (level > 3){ // possible self circle so limit deep by 3 - it enough in real system usage
            return data;
        }

        entity.eachAttribute(function(attr, attrName){
            node = {
                id: UB.core.UBUtil.gatherStr(parentEntityName, '.', attrName),
                text: attr.caption + "[" + attrName + "]" || attrName,
                leaf: attr.dataType !== Entity,
                parentId: parentEntityName || entityName
            };

            if ((attr.dataType === Entity) &&
                (entityName !== attr.associatedEntity)){ // self circle entity
                node.children = UB.core.UBUtil.getEntityAttributesTreeData(attr.associatedEntity, node.id, level + 1);
            }
            data.push(node);
        });

        return data;
    }





},function() {
    Ext.ns('UB.Utils');
    UB.Utils = UB.core.UBUtil;
});