/**
 * Load form View (formCode.def) and from controller (formCode*.js) if any from local cache or from model `public/forms` folder.
 * Evaluate both & return evaluation result. Used in $App.doCommand in case command type is `showForm`.
 */
Ext.define('UB.core.UBFormLoader', {
    requires: [
        'UB.core.UBAppConfig',
        'UB.core.UBService',
        'UB.core.UBUtil',
        'UB.core.UBCommand'
    ],
    uses: ['UB.core.UBApp'],

    singleton: true,
    formType: {
        auto: 'auto',
        custom: 'custom'
    },
    CACHE_PREFIX: 'ubm_form_formdata_',

    /**
     * Array of ExtJS class names, defined by UBFormLoader
     * This array is used by clearFormCache to **"undefine"** Pure Ext JS forms defined by form loader
     * @protected
     */
    definedClasses: [],
    /**
     *  For several-times evaluate we must generate unique file name (bug in chrome debugger?) TODO - check with Chrome version up to 39.0.
     */
    evaluatedNames: {},

    /**
     * @private
     * @param def
     * @return {*}
     */
    getComponentClassName: function(def) {
        return this.getComponentPart(def, /(?:Ext.define\s*?\(\s*?["'])([\w.]+?)(?=["'])/, 1);
    },

    /**
     * @private
     * @param def
     * @return {*}
     */
    getComponentRequires: function(def) {
        return this.getComponentPartAsArray(def, /(?:requires\s*?:\s*?\[)((\s*?.*?\s*?)*?)(?=\])/m, 1);
    },

    /**
     * @private
     * @param def
     * @return {*}
     */
    getComponentUses: function(def) {
        return this.getComponentPartAsArray(def, /(?:uses\s*?:\s*?\[)((\s*?.*?\s*?)*?)(?=\])/m, 1);
    },

    /**
     * @private
     * @param def
     * @param regexp
     * @param partNo
     * @return {*}
     */
    getComponentPartAsArray: function(def, regexp, partNo) {
        var
            p = UB.core.UBFormLoader.getComponentPart(def, regexp, partNo);
        return (p && p.length) ? Ext.JSON.decode('[' + p + ']') : [];
    },

    /**
     * @private
     * @param def
     * @param regexp
     * @param partNo
     * @return {String}
     */
    getComponentPart: function(def, regexp, partNo) {
        var
            m = regexp.exec(def);

        return (m && m.length>partNo) ? UB.core.UBUtil.removeWhitespaces(m[partNo]) : undefined;
    },

    /**
     * Return cache storage key from form with specified code
     * @protected
     * @param {String} formCode
     * @param {String} [part='formDef'] Either `formCode` or `formDef`
     */
    getFormCacheKey: function(formCode, part){
        return UB.core.UBFormLoader.CACHE_PREFIX + formCode + '_' + (part || 'formDef');
    },

    /**
     * Lookup form in `ubm_form` store
     * @param {String} entity Entity code for search
     * @param {Boolean} [allForms=false] return array of all entity forms or only first form founded
     * @return {Ext.data.Model|Array<Ext.data.Model>}
     */
    getFormByEntity: function(entity, allForms) {
        var
            store = UB.core.UBStoreManager.getFormStore(),
            forms = [],
            defaultForm = null;

        store.each(function(item){
            if(item.get('entity') === entity){
                forms.push(item);
                if(item.get('isDefault') === true &&  !defaultForm){
                    defaultForm = item;
                    if (!allForms) { // Not need all forms, just first default
                        return false;
                    }
                }
            }
        });
        defaultForm = defaultForm || forms[0];
        return allForms ? forms : defaultForm;
    },

    /**
     * Dirty hack to clear Ext-JS based forms. Do not use in production!
     * @protected
     * @param {string} className
     */
    undefineExtClass: function(className){
        var parts = className.split('.'), lastPart, root = window,
            c = Ext.ClassManager.get(className);

        if (!c) {
            return;
        }
        delete Ext.ClassManager.classes[className];
        //noinspection JSAccessibilityCheck
        delete Ext.ClassManager.existCache[className];
        if (parts.length){
            lastPart = parts.pop();
            for (var i= 0, ln=parts.length; i<ln; i++){
                root = root[parts[i]];
                if(!root){
                    break;
                }
            }
            if (root){
                delete root[lastPart];
            }
        }
    },

    /**
     *  Remove form with code = formCode from cache, or all form in case formCode is not passed.
     *  @param {String} [formCode]
     */
    clearFormCache: function(formCode) {
        var
            keysToRemove = [],
            prefix = UB.core.UBFormLoader.CACHE_PREFIX,
            regEx = new RegExp(prefix),
            key, LS = localStorage;

        if (formCode){
            keysToRemove.push(prefix + formCode + '_' + 'formDef');
            keysToRemove.push(prefix + formCode + '_' + 'formCode');
        }
        for(var i=0, len=LS.length; i<len; i++){
            key=LS.key(i);
            if(regEx.test(key)){
                keysToRemove.push(key);
            }
        }
        _.forEach(keysToRemove, function(key){
            LS.removeItem(key);
        });
        // dirty hack to clear Ext-JS based forms
        if (!formCode) {
            this.definedClasses.forEach(function (className) {
                UB.core.UBFormLoader.undefineExtClass(className);
            });
            this.definedClasses = [];
        }
        UB.logDebug('Forms data was cleared ' + (formCode ? ('for form ' + formCode) : 'for all forms'));
    },

    /**
     * Retrieve form view `def` and form module. Look in the localStore first and if not found - go to server.
     *
     * @param {Object} config
     * @param {String} config.formCode Code of form from `ubm_form.code`
     * @param {Function} [config.callback] Called with two parameter `callback(viewDefinition, codeDefinition)`
     * @param {Object} [config.scope] Scope to execute callback in
     * @return {Promise} Promise resolved to object {formView: ..., formController: ..., formType:..} object or function in case of ExtJS form
     */
    getFormViewAndController: function(config){
        var
            formStore = UB.core.UBStoreManager.getFormStore(),
            record,
            me = this,
            formType, formID, formDefReference, formJSReference;

        function getLocalOrRemote(id, code, attr, reference){
            var data;
            if (!reference || !reference.length){
                return Q.resolve('');
            }
            data = localStorage.getItem(UB.core.UBFormLoader.getFormCacheKey(code, attr));
            if (data){
                return Q.resolve(data);
            } else {
                return UB.core.UBService.getDocument({
                        id: id,
                        entity: 'ubm_form',
                        attribute: attr
                    },
                    null, null, {usePostMethod: true}
                ).then(function(data){
                    localStorage.setItem(UB.core.UBFormLoader.getFormCacheKey(code, attr), data);
                    return data;
                });
            }
        }

        function evalAsModule(source, fileName){
            var
                exports = {},
                evalFileName = fileName;
            if(source && source.length){
                //MPV - move to module pattern!
                if (fileName) {
                    if (me.evaluatedNames[fileName]){
                        me.evaluatedNames[fileName]++;
                        evalFileName = evalFileName + 'VM' + me.evaluatedNames[fileName];
                    } else {
                        me.evaluatedNames[fileName] = 1;
                    }
                    (new Function('exports', source + '\n//# sourceURL=' + evalFileName + '.js'))(exports);
                } else {
                    (new Function('exports', source))(exports);
                }
            }
            return exports;
        }

        record = formStore.findRecord('code', config.formCode, 0, false, true, true);
        if(!record){
            throw new Error('Unknown form code "' + config.formCode + '"');
        }
        formType = record.get('formType').toString();
        formDefReference = record.get('formDef').toString();
        formJSReference = record.get('formCode'); // null is possible here
        formJSReference = _.isNull(formJSReference) ? '' : formJSReference.toString();

        if (!formDefReference){
            throw new Error('Form definition is empty for form with code ' + config.formCode);
        }
        formID = record.get('ID');
        return Q.all([
            getLocalOrRemote(formID, config.formCode, 'formDef', formDefReference),
            getLocalOrRemote(formID, config.formCode, 'formCode', formJSReference)
        ]).then(function(arr){
            var
                formViewStr = arr[0],
                formControllerStr = arr[1],
                parsed = {formType: formType},
                deffer;
            switch (formType){
                case 'auto':
                    parsed.formView  = evalAsModule(formViewStr).formDef;
                    parsed.formController = evalAsModule(formControllerStr, config.formCode).formCode;
                    if (parsed.formView.requires && parsed.formView.requires.length){
                        deffer = Q.defer();
                        Ext.require(parsed.formView.requires, function(){
                            return deffer.resolve(parsed);
                        });
                        return deffer.promise;
                    } else {
                        return parsed;
                    }
                case 'custom':
                    return UB.core.UBFormLoader.createExtClass(formViewStr, config.formCode);
                case 'vue':
                    parsed.formView = formViewStr;
                    parsed.formController = evalAsModule(formControllerStr, config.formCode).formCode;
                    return parsed;
                default:
                   throw new Error('Unknown form type ' + formType + ' for form ' + config.formCode);
            }
        });
    },

    /**
     * Create ExtJS class from file. Parse definition - load all required  & uses first
     * @protected
     * @param {String} classScript String representation of script
     * @param {String} fileName Name to show in evaluated scripts list
     * @return {promise}  Promise resolved to object {formView: Ext.Base reference}
     */
    createExtClass: function(classScript, fileName) {
        var
            deferred,
            className = UB.core.UBFormLoader.getComponentClassName(classScript),
            definedClass = Ext.ClassManager.get(className),
            requires, undefinedClasses;

        function doOnRequiredLoaded(){
            var
                extClass;
            try {
                extClass = eval(classScript + '\n//# sourceURL=' + fileName + '.js');
                deferred.resolve({formView: extClass});
            } catch(e) {
                deferred.reject(new Error('Errors in file '+ fileName + '.def\n' + e.message));
            }
        }

        deferred = Q.defer();
        if(definedClass) {
            deferred.resolve({formView: definedClass});
        } else {
            UB.core.UBFormLoader.definedClasses.push(className);
            // parse class definition and extract requires & uses
            requires = Ext.Array.merge(UB.core.UBFormLoader.getComponentRequires(classScript), UB.core.UBFormLoader.getComponentUses(classScript));

            // filter only undefined classes
            undefinedClasses = _.filter(requires, function (className) {
                return !Ext.ClassManager.get(className);
            });
            if (undefinedClasses.length) {
                Ext.require(undefinedClasses, doOnRequiredLoaded);
            } else {
                doOnRequiredLoaded();
            }
        }
        return deferred.promise;
    }
});