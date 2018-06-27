/**
 * Created by v.orel
 *
 * WebDav Doccument Detail Attribute provider.
 * For read and write value of doccument detail attribute of UB entity
 *
 * todo: refactor
 *
 * Usage: \\host[@ssl]@port\rootName\entity\attribute\id\main.ext
 */

var provider = exports,
    level, isMain, tmp, gcKey,
    entity, attribute, id, fileName,
    store, docStore, docID, lastModified, creationDate, docFti;


/**
 * Set path from request. This method calls in every new request.
 * @param path
 */
provider.setPath = function(path) {
    id = null;
    docFti = null;
    level = path.length;
    if (level !== 4) {
        entity = null;
        return;
    }
    entity = path[0];
    attribute = path[1];
    id = parseInt(path[2]);
    fileName = path[3];
    isMain = fileName.substr(0,5) === 'main.';
    gcKey = entity+'|'+attribute+'|'+id+'|'+fileName;
    tmp = isMain ? '' : App.globalCacheGet(gcKey);
    tmp = tmp ? JSON.parse(tmp) : {id: null, lock: null};
    store = new TubDataStore(entity);
    store.run('select', {
        entity: entity,
        method: 'select',
        ID: id,
        fieldList: ['ID', 'docID', 'mi_modifyDate', 'mi_createDate', attribute]
    });
    docID = store.get(1);
    creationDate = store.get(2);
    lastModified = store.get(2);
    docFti = JSON.parse(store.get(4));
    docStore = new TubDataStore('doc_document');
};

/**
 * Is current path exists
 * @return {boolean}
 */
provider.exists = function() {
    return (level<4 || (id>0 && (isMain || tmp.id)));
};

/**
 * properties handler
 * @type {{DAV:: {resourcetype: resourcetype, getlastmodified: getlastmodified, creationdate: creationdate, getcontentlength: getcontentlength, getetag: getetag}, getPropValue: getPropValue, getAllPropsList: getAllPropsList, setPropValue: setPropValue, delProp: delProp}}
 */
provider.properties = {
    "DAV:": {
        /**
         * <D:collection /> if dirrectory and null in other case
         * @param item
         * @returns {String|null}
         */
        resourcetype: function(item){
            return entity === null?'<D:collection />':null;
        },
        getlastmodified: function(item) {
            return entity === null?null:(new Date(lastModified)).toGMTString();
        },
        creationdate: function(item) {
            return entity === null?null:(new Date(creationDate)).toGMTString();;
        },
        getcontentlength: function(item) {
            return docFti ? docFti.size : null;
        },
        getetag: function(item) {
            return docFti ? docFti.md5 : null;
        },
        getcontenttype: function(item) {
            return docFti ? docFti.contentType : null;
        }
    },
    getPropValue: function(item, ns, name){
        return null;
    },
    setPropValue: function(ns, name, value){
        return null;
    },
    delProp: function(ns, name) {
        return null;
    }
};

provider.getItems = function() {
    var elem,
        res = [];
    //every node is empty folder
    return res;
};

provider.doGet = function(resp){
    var docHandler,
        docReq = new TubDocumentRequest();
    docReq.entity = entity;
    docReq.attribute = attribute;
    docReq.id = isMain?id:tmp.id;
    docReq.isDirty = !isMain;//node.isTemp;
    docHandler = docReq.createHandlerObject(false);
    docHandler.loadContent(TubLoadContentBody.No /*WithBody*/);
    docHandler.fillResponse();
};

provider.getContentLength = function() {
    return docFti ? docFti.size : null;
    if (entity === null)
        return 0;
    var docHandler,
        docReq = new TubDocumentRequest();
    docReq.entity = entity;
    docReq.attribute = attribute;
    docReq.id = isMain?id:tmp.id;
    docReq.isDirty = !isMain;
    docHandler = docReq.createHandlerObject(false);
    docHandler.loadContent(TubLoadContentBody.No /*WithBody*/);
    return docHandler.content.size;
};

provider.doPut = function(req) {
    var docHandler,
        isNew = !isMain && (tmp.id===null),
        reqContent,
        docReq = new TubDocumentRequest();

    docReq.entity = entity;
    docReq.attribute = attribute;
    if (isNew) {
        tmp.id = store.generateID();
        App.globalCachePut(gcKey, JSON.stringify(tmp));
    }
    docReq.id = isMain?id:tmp.id;
    docReq.isDirty = true;
    docReq.entity = entity;
    docReq.attribute = attribute;
    reqContent = req.read('bin');
    docReq.setBodyFromArrayBuffer(reqContent);
    reqContent = null;

    if (isMain) {
        docHandler = docReq.createHandlerObject(false);
        docHandler.loadContentFromRequest(TubLoadContentBody.No);

        store.run('select', {
            entity: entity,
            method: 'select',
//            lockType: 'ltTemp',
            ID: id,
            fieldList: [attribute, 'mi_modifyDate']
        });

        var prevFti = JSON.parse(store.get(0)),
            updateParams = {
                ID: id,
                mi_modifyDate: store.get(1)
            };

        docHandler.content.fName = prevFti.fName;
        docHandler.content.origName = prevFti.origName;
        docHandler.content.ct = prevFti.ct;
        docHandler.saveContentToTempStore();
        docHandler.content.revision = prevFti.revision;
        docHandler.content.fName = prevFti.fName;
        docHandler.content.origName = prevFti.origName;
        docHandler.content.ct = prevFti.ct;
        updateParams[attribute] = JSON.stringify(docHandler.content);

        mi_modifyDate = store.get(1);

        store.run('update', {
            entity: entity,
            method: 'update',
            execParams: updateParams
        });
    }

    return isNew;

};

provider.doMove = function(destination, overwrite) {
    // undefined - bad destanation
    // false - cannot overwrite
    // true - created
    // null - owerrided
    debugger;

    if (destination.length != 4 || destination[0] != entity || destination[1] != attribute ||  destination[2] != id )
        throw new Error('invalid destination');

    var
        res,
        destFileName = destination[3],
        destIsMain = destFileName.substr(0,5) === 'main.',
        destGcKey = entity+'|'+attribute+'|'+id+'|'+destFileName,
        destTmp = destIsMain ? '' : App.globalCacheGet(destGcKey);
    destTmp = destTmp ? JSON.parse(destTmp) : {id: null, lock: null};

    res = !destIsMain && !destTmp.id ? true : null;

    if (!overwrite && !res) {
        return false;
    }

    var docHandler,
        docReq;

    docReq = new TubDocumentRequest();
    docReq.entity = entity;
    docReq.attribute = attribute;
    docReq.id = isMain?id:tmp.id;
    docReq.isDirty = !isMain;
    docHandler = docReq.createHandlerObject(false);
    docHandler.loadContent(TubLoadContentBody.Yes /*WithBody*/);

    //p->t
    if (isMain) {

        if (res) {
            destTmp.id = store.generateID();
            App.globalCachePut(destGcKey, JSON.stringify(destTmp));
        }

        docHandler.request.id = destTmp.id;
        docHandler.saveContentToTempStore();
        return res;
    }

    //t->p
    if (!isMain) {
        if (res) {
            // new file
            throw new Error('todo');
        }

        store.run('select', {
            entity: entity,
            method: 'select',
//            lockType: 'ltTemp',
            ID: id,
            fieldList:[attribute, 'mi_modifyDate']
        });

        var prevFti = JSON.parse(store.get(0)),
            updateParams = {
                ID: id,
                mi_modifyDate: store.get(1)
            };

        docHandler.request.id = id;
        docHandler.content.fName = prevFti.fName;
        docHandler.content.origName = prevFti.origName;
        docHandler.content.ct = prevFti.ct;
        docHandler.saveContentToTempStore();
        docHandler.content.revision = prevFti.revision;
        docHandler.content.fName = prevFti.fName;
        docHandler.content.origName = prevFti.origName;
        docHandler.content.ct = prevFti.ct;
        updateParams[attribute] = JSON.stringify(docHandler.content);

        store.run('update', {
            entity: entity,
            method: 'update',
            execParams: updateParams
        });

//        store.run('unlock', {
//            entity: entity,
//            method: 'unlock',
//            ID: id
//        });

        App.globalCachePut(gcKey, '');
//      delete temp from disk
//        provider.doDelete();
        return res;
    }

    throw new Error('todo');
};

provider.getLock = function(destination) {
    if (level<4) return {};
    if (!isMain) {
        if (tmp.lock) {
            lock = {lockUser: tmp.lock};
        } else {
            return {};
        }
    } else {

        docStore.run('select', {
            entity: entity,
            method: 'select',
            ID: docID,
            fieldList: ['ID']
        });

        docStore.run('isLocked', {
            entity: 'doc_document',
            method: 'isLocked',
            ID: docID,
            fieldList: ['ID']
        });
        if (!docStore.lockResult)
            return {};

        var lock = JSON.parse(docStore.lockResult);
    }
    if (lock.lockType==='None' || (lock.lockType==='Temp' && new Date().getTime() - new Date(lock.lockTime).getTime()>60000))
        return {};
    return {
        scope: 'exclusive',
        type: 'write',
        owner: lock.lockUser,
        depth: Infinity,
        timeout: 60,
        token: isMain?id:tmp.id
    }
};

provider.doLock = function(lockObj) {
    lockObj.depth = Infinity;
    lockObj.timeout = 60;
    lockObj.token = isMain?id:tmp.id;

    if (!isMain) {
        tmp.lock = Session.userID;
        App.globalCachePut(gcKey,JSON.stringify(tmp));
    } else {
        docStore.run('select', {
            entity: 'doc_document',
            method: 'select',
            ID: docID,
            lockType: 'ltTemp',
            fieldList: ['ID']
        });
    }

    return lockObj;
};

provider.doUnLock = function(token) {
    if (isMain?id:tmp.id == token) {
        if (!isMain) {
            tmp.lock = null;
            App.globalCachePut(gcKey,JSON.stringify(tmp));
        } else {
            docStore.run('unlock', {
                entity: 'doc_document',
                method: 'unlock',
                ID: docID
            });
        }
        return true;
    }
    return false;
};

provider.doDelete = function() {
    return false;
};

provider.doCreateDir = function() {
    return false;
};