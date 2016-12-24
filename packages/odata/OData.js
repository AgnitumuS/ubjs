/**
 * OData(v4) provider for UnityBase. After call to OData.registerEndpoint UB enityties are accessible using OData protocol.
 *
         var OData = require('@ub-e/odata');

         var endpoint = OData.registerEndpoint({
            endpointName: 'ODataV4',
            namespace: 'autotest',
            requireAuth: false,
            skipOptimisticLock: true,
            entitySetMapping: {
                ODataRef: App.domain.byName('tst_ODataRef'),
                ODataSimple: App.domain.byName('tst_ODataSimple')
            }
         });
 *
 * We strongly recommend to use a `ubql` because it is easier, more convenient and faster than the `OData`
 * @tutorial odata
 * @module OData
 */
const querystring = require('querystring'),
    parser = require('odatav4-parser'),
    url = require("url"),
    Router = require('./router'),
    XMLBuilder = require('xmlbuilder');

var endpoints = {};

/**
 * Register OData endpoint
 * @param {Object} props
 * @param {String} props.endpointName
 * @param {String} props.namespace OData metadata namespace (application name, for example)
 * @param {String} [props.requireAuth=true]
 * @param {Boolean} [props.skipOptimisticLock=false] If true will skip Optimistic Lock even for entities with mStorage.simpleAudit: true. If false - will use ETag value as a mi_modifyDate
 * @param {Object<String, TubEntity>} [props.entitySetMapping] key-value, where keys is entitySet name & values is UB entity. If empty - filled from all domain entities
 * @return {ODataEndpoint}
 */
module.exports.registerEndpoint = function registerEndpoint(props) {
    var endpoint;
    if (endpoints[props.endpointName])
        throw new Error('Endpoints already registered');

    endpoints[props.endpointName] = endpoint = new ODataEndpoint(props);
    App.registerEndpoint(props.endpointName, endpoint.handle.bind(endpoint), props.requireAuth !== false);

    return endpoint;
};

function ODataError(message, code) {
    this.name = 'ODataError';
    this.code = code || 500;
    this.message = message;
    this.stack = (new Error()).stack;
}
ODataError.prototype = new Error();
ODataError.prototype.constructor = ODataError;

/**
 * Construct new ODataEndpoint
 * @param {Object} props
 * @constructor
 */
function ODataEndpoint(props){
    var l, i, ubEntity, entities;

    this.endpointName = props.endpointName;
    this.namespace = props.namespace;
    this.entitySetMapping = {};
    this.serviceUrl = App.serverURL + '/' + props.endpointName;
    this.doSkipOptimisticLock = props.skipOptimisticLock || false;
    if (props.entitySetMapping){
        _.defaults(this.entitySetMapping, props.entitySetMapping)
    } else {
        l = App.domain.count;
        entities = App.domain.items;
        for (i=0; i<l; i++){
             ubEntity = entities[i];
             this.entitySetMapping[ubEntity.name] = ubEntity;
         }
    }
}

/**
 * Main OData endpoint handler. Will parse the request route and call sub-handler.
 * @param {THTTPRequest} req
 * @param {THTTPResponse} res
 */
ODataEndpoint.prototype.handle = function(req, res){
    if (!this.router) {
        this.router = new Router();
        this._initializeRoutes();
    }

    this.router.dispatch(req, res);
};

/**
 * Initialize router for OData protocol
 * @private
 */
ODataEndpoint.prototype._initializeRoutes = function () {
    var self = this;
    this.router.get("/\$metadata", function(req, res, params) {
        self.metadata(req, res, params);
    });
    this.router.get("/:entitySet/\$count/", function(req, res, params) {
        params.$count = true;
        self.query(req, res, params);
    });
    this.router.get("/:entitySet\\(:id\\)", function(req, res, params) {
        self.queryByID(req, res, params);
    });
    this.router.get("/:entitySet", function(req, res, params) {
        self.query(req, res, params);
    });
    this.router.get("/", function(req, res, params) {
        self.collections(req, res, params);
    });
    this.router.post("/:entitySet", function(req, res, params) {
        self.insert(req, res, params);
    });
    this.router.patch("/:entitySet\\(:id\\)", function(req, res, params) {
        self.update(req, res, params);
    });
    this.router.delete("/:entitySet\\(:id\\)", function(req, res, params) {
        self.remove(req, res, params);
    });


    this.router.error(function(req, res, error) {
        function def(e) {
            //self.emit("odata-error", e);
            res.statusCode = error.code || 500;
            //res.writeHead(error.code || 500, {'Content-Type': 'application/json'});
            res.writeEnd({
                "error": {
                    "code": error.code || 500,
                    "message": e.message,
                    "target": req.url,
                    "details": []
                },
                "innererror": { }
            });
        }
        //if (self.cfg.error) {
        //    self.cfg.error(req, res, error, def);
        //}
        //else {
        //console.error(error);
        def(error);
        throw error;
        //}
    });
};

// see http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part3-csdl/odata-v4.0-errata02-os-part3-csdl-complete.html#_The_edm:Documentation_Element
var ub2ODataTypeMapping = {};
ub2ODataTypeMapping[TubAttrDataType.String] = 'Edm.String';
ub2ODataTypeMapping[TubAttrDataType.Int]    = 'Edm.Int32';
ub2ODataTypeMapping[TubAttrDataType.BigInt] = 'Edm.Int64';
ub2ODataTypeMapping[TubAttrDataType.Float]  = 'Edm.Double';
ub2ODataTypeMapping[TubAttrDataType.Currency]= 'Edm.Decimal';
// Edm.Boolean wait for true/false during serialization, but actually in UB boolean represented as 0/1 so
// TODO annotate in metadata
ub2ODataTypeMapping[TubAttrDataType.Boolean] = 'Edm.Byte';
ub2ODataTypeMapping[TubAttrDataType.DateTime]= 'Edm.DateTimeOffset'; // always in UTC0
ub2ODataTypeMapping[TubAttrDataType.Text]   = 'Edm.String';
ub2ODataTypeMapping[TubAttrDataType.ID]     = 'Edm.Int64';
ub2ODataTypeMapping[TubAttrDataType.Entity] = 'Edm.Int64';
ub2ODataTypeMapping[TubAttrDataType.Document]= 'Edm.Stream'; //?? actually info about there stream are. Client must use getDocument to retrieve actual value
ub2ODataTypeMapping[TubAttrDataType.Many]= 'Edm.String';
ub2ODataTypeMapping[TubAttrDataType.TimeLog]= 'Edm.Int32';
ub2ODataTypeMapping[TubAttrDataType.Enum] = 'Edm.String';
ub2ODataTypeMapping[TubAttrDataType.BLOB]= 'Edm.Binary';
ub2ODataTypeMapping[TubAttrDataType.Date]= 'Edm.Date'; // actually date without time

/**
 * Metadata /$metadata request
 * @param {THTTPRequest} req
 * @param {THTTPResponse} res
 * @param {Object} params
 */
ODataEndpoint.prototype.metadata = function(req, res, params){
    var me = this,
        domain = me.entitySetMapping,
        schemas = [];

    //// EnumType's - not supported by OData: OData require enum value to be Int32. UB store enum values as a string
    //var enums = UB.Repository('ubm_enum').attrs(['eGroup','code', 'name']).selectAsObject();
    //var gruppedEnums = _.groupBy(enums, 'eGroup');
    //
    //_.forEach(gruppedEnums, function(enumItems, enumCode){
    //    var enumType = {
    //            "EnumType": {
    //                "@Name": enumCode,
    //                "#list": []
    //            }
    //        },
    //        list = enumType.EnumType['#list'];
    //    enumItems.forEach(function(enumItem){
    //        list.push({"Member": {"@Name": enumItem.name, "@Value": enumItem.code}})
    //    });
    //    schemas.push(enumType);
    //});

    var resultEntitySets = {};
    //EntityType's
    _.forEach(domain, function(entity, entitySetName){
        var
            entityName = entity.name,
            attributes = JSON.parse(entity.attributes.asJSON);

        var entityType = {
                "EntityType": {
                    "@Name": entity.name
                }
            };

        if (entity.attributes.byName('ID')){
            // primary key (always ID)
            entityType["EntityType"]["Key"] = { // Must be BEFORE attrbutes list. WTF!
                "PropertyRef": {
                    "@Name": "ID"
                }
            };
        } else {
            console.warn('Skip entity"', entityName, 'withiut ID attribute');
            return;
        }
        if (entity.attributes.count) {
            var props = entityType.EntityType['#list'] = [];

            _.forEach(attributes, function (attrDef, attrName) {
                var propDef;
                var simpleType = ub2ODataTypeMapping[attrDef.dataType];
                if (simpleType) {
                    propDef = {"Property": {"@Name": attrName, "@Type": simpleType}};
                    if (attrDef.allowNull === false) {
                        propDef["Property"]["@Nullable"] = false
                    }

                    // add enum via annotation. TODO terms vocabulary must be defined first
                    //if (attrDef.dataType === TubAttrDataType.Enum){ // add annotation for enum
                    //    propDef["Property"].Annotation = {
                    //        "@Term": "ENUM",
                    //        "#list": []
                    //    }
                    //    eList = propDef["Property"].Annotation['#list'];
                    //    _.forEach(gruppedEnums[attrDef.enumGroup], function(eDef){
                    //        eList.push({
                    //            "EnumMember": eDef.code
                    //        })
                    //    })
                    //}
                    props.push(propDef);

                    // Add NavigationProperty with ReferentialConstraint
                    if (attrDef.dataType === TubAttrDataType.Entity) {
                        propDef = {
                            "NavigationProperty": {
                                "@Name": attrName + '2' + attrDef.associatedEntity, // force create virtual OData attribute
                                "@Type": me.namespace + "." + attrDef.associatedEntity,
                                "@Partner": entityName,
                                "ReferentialConstraint": {
                                    "@Property": attrName, "@ReferencedProperty": attrDef.associationAttr || "ID"
                                }
                            }
                        };
                        props.push(propDef);
                    }
                } else {
                    console.error(entityName, attrName, ': invalid property type for OData')
                }
            });
        }
        schemas.push(entityType);
        resultEntitySets[entitySetName] = entity;
    });

    // EntitySets (in somle case - direct mapping to UB entities)
    var container = {
                "EntityContainer": {
                    "@Name": "Context",
                    "#list": []
                }
        },
        list = container.EntityContainer['#list'];

    _.forEach(resultEntitySets, function(entity, entitySetName){
        list.push({
            "EntitySet": {
                "@EntityType": me.namespace + "." + entity.name,
                "@Name": entitySetName
            }
        });
    });
    schemas.push(container);

    var XMLMetadata = XMLBuilder.create({
        "edmx:Edmx": {
            "@xmlns:edmx": "http://docs.oasis-open.org/odata/ns/edmx",
            "@Version": "4.0",
            "edmx:DataServices": {
                "Schema": {
                    "@xmlns": "http://docs.oasis-open.org/odata/ns/edm",
                    "@Namespace": me.namespace,
                    "#list": schemas
                }
            }
        }
    }).end({pretty: true});
    res.statusCode = 200;
    res.writeHead('Content-Type: application/xml;charset=utf-8\r\nDataServiceVersion: 4.0\r\nOData-Version: 4.0');
    res.writeEnd(XMLMetadata);
};

/**
 * Write "Resource not found" error back to caller
 * @param {THTTPRequest} req
 * @param {THTTPResponse} res
 * @param {Object} params
 */
ODataEndpoint.prototype.notFoundError = function(req, res, params){

    res.writeEnd(['<m:error xmlns:m="http://docs.oasis-open.org/odata/ns/metadata"><m:code/><m:message>Resource not found for the segment \'',
        params.entitySet,
        "'.</m:message> </m:error>"
        ].join('')
    );
    res.writeHead('Content-Type: application/xml;charset=utf-8');
    res.statusCode = 404;
};

/**
 * Check entity set exist in entitySetMapping and return entity or write notFound resp and return null
 * @param {THTTPRequest} req
 * @param {THTTPResponse} res
 * @param {Object} params
 * @param {String} [method] if passed check ELS
 * @return {TubEntity|null}
 */
ODataEndpoint.prototype.checkEntitySet = function(req, res, params, method){
    var me = this,
        domain = me.entitySetMapping,
        entity = domain[params.entitySet];
    if (!entity){
        me.notFoundError(req, res, params)
    }
    if (method && !App.els(entity.name, method)){
        throw new ODataError('Access to ' + entity.name + '.select is forbidden', 403);
    }
    return entity;
};

/**
 * Single instance request
 * @param {THTTPRequest} req
 * @param {THTTPResponse} res
 * @param {Object} params
 */
ODataEndpoint.prototype.queryByID = function(req, res, params){
    var
        me = this, entity;
    entity = me.checkEntitySet(req, res, params);
    console.debug('QueryByID with params:', params);
    if (entity){
        var record = UB.Repository(entity.name).attrs('*').where('ID', '=', parseInt(params.id, 10)).selectAsObject()[0];
        if (!record) {
            me.notFoundError(req, res, params)
        } else {
            //"@odata.context": "http://services.odata.org/V4/OData/(S(03ofpxjklb2w5xahdzlbin3b))/OData.svc/$metadata#Products/$entity"
            //record["@odata.context"] = App.serverURL + '/' + me.endpointName + '/$metadata#' + params.entitySet + '/$entity';
            res.writeEnd(record);
            if (record.mi_modifyDate){
                res.writeHead("ETag: " + new Date(record.mi_modifyDate).getTime());
            }
            res.statusCode = 200;
        }
    }
};

/*!
 * Simple OData $filter expressions. Example:
 * { type: 'eq',  left: { type: 'property', name: 'code' },   right: { type: 'literal', value: 'code001' } }
 */
var isSimpleExpr = {'lt': true, 'gt': true, 'le': true, 'ge': true, 'eq': true, 'ne': true};
var booleanFunc2Args = {'contains': 'contains', 'not contains': 'notContains', 'startwith': 'startwith', 'not startwith': 'notStartWith'};
var booleanFunc1Arg ={'length': 'length', 'tolower': 'lower', 'toupper': 'upper', 'day': 'day', 'month':'month', 'year': 'year', 'round': 'round', 'floor': 'floor', 'ceiling': 'ceiling'};

//test case
// http://127.0.0.1:888/autotest/ODataV4/tst_document?$orderby=code+desc&$top=20&$select=ID,code,docDate,description&$filter=(contains(code,%27Code%27))+and+length(description)+ge+10&$count=true
/**
 * Single instance request
 * @param {THTTPRequest} req
 * @param {THTTPResponse} res
 * @param {Object} params
 */
ODataEndpoint.prototype.query = function(req, res, params){
    var
        urlParams = req.decodedParameters,
        entity, repo, data, prm,
        withTotal=false,
        haveORCondition = false,
        oFilters;

    entity = this.checkEntitySet(req, res, params, 'select');
    console.debug('QUERY request: ', params);

    repo = UB.Repository(entity.name);
    if (entity){
        if (!urlParams){
            console.debug('simple request to full entity');
            repo.attrs('*');
        } else {
            var oDataQuery = parser.parse(urlParams);
            if(oDataQuery.error) {
                throw new Error(oDataQuery.error);
            }
            if (prm = oDataQuery['$skip']){
                repo.start(prm)
            }
            if (prm = oDataQuery['$top']){
                repo.limit(prm)
            }
            prm = oDataQuery['$select'];
            if (_.isArray(prm) && prm.length){
                repo.attrs(prm)
            } else {
                repo.attrs('*');
            }
            withTotal = oDataQuery['$count'] || (oDataQuery['$inlinecount'] === 'allpages') || params.$count || false;
            if (withTotal){
                repo.withTotal();
            }
            prm = oDataQuery['$orderby'];
            if (prm){
                prm.forEach(function(orderExpr){
                    var attrName = Object.keys(orderExpr)[0];
                    repo.orderBy(attrName, orderExpr[attrName]);
                });
            }
            prm = oDataQuery['$filter'];
            console.debug('PARSED odata query is:', JSON.stringify(oDataQuery));
            if (prm){
                if (Array.isArray(prm)) { // in case of one filter $filters is object
                    oFilters = _.chain(prm).flatten().without('').value(); // gramar for and/or condition will create nested arrays, so we need flatten
                } else {
                    oFilters = [prm]
                }
                console.debug('FLATTEN odata filters is:', JSON.stringify(oFilters));
                // add all conditions to where list. Name of condition is generated as c + idx in array
                oFilters.forEach(function(elm, idx){
                    var attr, val;
                    if (_.isObject(elm)){
                        console.debug('Got a simple expr', JSON.stringify(elm));
                        if (isSimpleExpr[elm.type]){
                            if (elm.right.type !== 'literal') {
                                throw new Error('Right side of simple condition must be a literal value', elm);
                            }
                            val = elm.right.value;
                            // {"type":"ge","left":{"type":"functioncall","func":"length","args":[{"type":"property","name":"description"}]},"right":{"type":"literal","value":10}}
                            if (elm.left.type === 'property') {
                                attr = elm.right.name;
                            } else if ((elm.left.type === 'functioncall') && booleanFunc1Arg[elm.left.func] && elm.left.args[0].type === 'property'){
                                attr = booleanFunc1Arg[elm.left.func] + '([' + elm.left.args[0].name + '])'
                            } else {
                                throw new Error('Left side of simple condition must be a either a property or a boolean function with argument of property type', elm);
                            }
                            repo.where(attr, elm.type, val, 'c' + idx);
                        } else if ((elm.type === 'functioncall') && booleanFunc2Args[elm.func]) {
                            //{"type":"functioncall","func":"contains","args":[{"type":"property","name":"code"},{"type":"literal","value":"e01"}]}
                            if ((elm.args[0].type === 'property') && (elm.args[1].type === 'literal')) {
                                repo.where(elm.args[0].name, booleanFunc2Args[elm.func], elm.args[1].value, 'c' + idx);
                            } else {
                                throw new Error('Left agr of ' + elm.func + ' function must be attribute & right - a value', elm);
                            }
                        } else {
                            //tolower,toupper, day, month, year, round, floor, ceiling
                            throw new Error('Unsupported condition type', elm.type);
                        }
                    } else {
                        if (elm === 'or') haveORCondition = true;
                    }
                });
            }
            if (haveORCondition){
                prm = oFilters.reduce(function(predicat, item, itemIndex){
                    return predicat + (_.isObject(item) ? '[c'+itemIndex + ']' : item);
                }, '');
                repo.logic(prm);
            }
        }
    }
    var store = repo.selectAsStore();
    data = store.asJSONObject;
    if (withTotal){
        var totalRecCount = store.totalRowCount;
        var prefix = (oDataQuery['$inlinecount'] === 'allpages') ? '' : '@';
        res.write('{"' + prefix + 'odata.count":' + totalRecCount + ',"value":');
    } else {
        res.write('{"value":');
    }
    store.freeNative();
    res.write(data);
    res.writeEnd('}');
    res.statusCode = 200;
};

/**
 * Root OData request - must return a EntitySet collection
 * @param {THTTPRequest} req
 * @param {THTTPResponse} res
 * @param {Object} params
 */
ODataEndpoint.prototype.collections = function(req, res, params){
    var model = this.entitySetMapping;

    var collections = Object.keys(model).map(function(eSet){
        return {
            "kind": "EntitySet",
            "name": eSet,
            "url": eSet
        };
    });

    res.statusCode = 200;
    res.writeEnd({
        "@odata.context": this.serviceUrl + "/$metadata",
        "value": collections
    });
};

ODataEndpoint.prototype.insert = function(req, res, params){
    var
        entity = this.checkEntitySet(req, res, params, 'insert'),
        execParams = JSON.parse(req.read()),
        i;

    console.debug('Insert OData request: ', execParams);
    var store = new TubDataStore(entity);
    store.run('insert', {execParams: execParams});
    store.currentDataName = 'selectAfterInsert';
    if (!store.eof) {
        i = store.fieldIndexByName('mi_modifyDate');
        if (i >= 0) res.writeHead("ETag: " + new Date(store.get(i)).getTime());
    }
    res.statusCode = 204;
};

/**
 * PATCH OData request. Support optimistic lock using E-Tag
 * @param {THTTPRequest} req
 * @param {THTTPResponse} res
 * @param {Object} params
 */
ODataEndpoint.prototype.update = function(req, res, params){
    //TODO 'If-Match' header! 412 resp in case not match

    var id = parseInt(params.id, 10);
    if (!id){
        throw new ODataError('Invalid key value: ', params.id);
    }
    var entity = this.checkEntitySet(req, res, params, 'update');
    var headers = req.headers;
    console.debug('Got headers:', headers);
    console.debug('UPDATE request: ', params);
    var execParams = JSON.parse(req.read());
    execParams.ID = id;
    console.debug('Update OData request: ', execParams);
    var store = new TubDataStore(entity);
    if (this.doSkipOptimisticLock){
        store.run('update', {
            __skipOptimisticLock: true,
            execParams: execParams
        })
    } else {
        store.run('update', {execParams: execParams});
    }
    store.freeNative();

    res.statusCode = 204;
    //if (headers.return) return=minimal
      //204 - no content
    //return=representation
      // 200 body
};

ODataEndpoint.prototype.remove = function(req, res, params){
    //TODO 'If-Match' header! 412 resp in case not match
    var id = parseInt(params.id, 10);
    if (!id){
        throw new ODataError('Invalid key value: ', params.id);
    }
    var entity = this.checkEntitySet(req, res, params, 'delete');
    var headers = req.headers;
    console.debug('Got headers:', headers);
    console.debug('DELETE request: ', params);
    var store = new TubDataStore(entity);
    if (this.doSkipOptimisticLock){
        store.run('delete', {
            __skipOptimisticLock: true,
            execParams: {ID: id}
        })
    } else {
        store.run('delete', {execParams: {ID: id}});
    }
    res.statusCode = 204;
};
