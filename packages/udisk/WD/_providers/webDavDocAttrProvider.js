/**
 * Created by v.orel
 *
 * WebDav Doccument attribute provider.
 * For read and write value of doccument attribute of UB entity
 *
 * Usage: \\host[@ssl]@port\rootName\entity\attribute\id\main.ext
 */

var provider = exports,
    level, isMain, tmp, gcKey,
    entity, attribute, id, fileName,
    store;


/**
 * Set path from request. This method calls in every new request.
 * @param path
 */
provider.setPath = function (path) {
    id = null;
    level = path.length;
    if (level !== 4) {
        entity = null;
        return;
    }
    entity = path[0];
    attribute = path[1];
    id = parseInt(path[2]);
    fileName = path[3];
    isMain = fileName.substr(0, 5) === 'main.';
    gcKey = entity + '|' + attribute + '|' + id + '|' + fileName;
    tmp = isMain ? '' : App.globalCacheGet(gcKey);
    tmp = tmp ? JSON.parse(tmp) : {id: null, lock: null};
    store = new TubDataStore(entity);
};

/**
 * Is current path exists
 * @return {boolean}
 */
provider.exists = function () {
    return (level < 4 || (id > 0 && (isMain || tmp.id)));
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
        resourcetype: function (item) {
            return entity === null ? '<D:collection />' : null;
        },
        getlastmodified: function (item) {
            return null;
        },
        creationdate: function (item) {
            return null;
        },
        getcontentlength: function (item) {
            return null;
        },
        getetag: function (item) {
            return null;
        }
    },
    getPropValue: function (item, ns, name) {
        return null;
    },
    setPropValue: function (ns, name, value) {
        return null;
    },
    delProp: function (ns, name) {
        return null;
    }
};

provider.getItems = function () {
    var elem,
        res = [];
    //every node is empty folder
    return res;
};

provider.doGet = function (resp) {
    var docHandler,
        docReq = new TubDocumentRequest();
    docReq.entity = entity;
    docReq.attribute = attribute;
    docReq.id = isMain ? id : tmp.id;
    docReq.isDirty = !isMain;//node.isTemp;
    docHandler = docReq.createHandlerObject(false);
    docHandler.loadContent(TubLoadContentBody.No /*WithBody*/);
    docHandler.fillResponse();
};

provider.getContentLength = function () {
    if (entity === null)
        return 0;
    var docHandler,
        docReq = new TubDocumentRequest();
    docReq.entity = entity;
    docReq.attribute = attribute;
    docReq.id = isMain ? id : tmp.id;
    docReq.isDirty = !isMain;
    docHandler = docReq.createHandlerObject(false);
    docHandler.loadContent(TubLoadContentBody.No /*WithBody*/);
    return docHandler.content.size;
};

provider.doPut = function (req) {
    var docHandler,
        isNew = !isMain && (tmp.id === null),
        reqContent,
        storeInfo,
        docReq = new TubDocumentRequest();

    docReq.entity = entity;
    docReq.attribute = attribute;
    if (isNew) {
        tmp.id = store.generateID();
        App.globalCachePut(gcKey, JSON.stringify(tmp));
    }
    docReq.id = isMain ? id : tmp.id;
    docReq.isDirty = true;
    docReq.entity = entity;
    docReq.attribute = attribute;
    reqContent = req.read('bin');

    if (isMain) {
        store.run('select', {
            entity: entity,
            method: 'select',
            lockType: 'ltTemp',
            ID: id,
            fieldList: [attribute, 'mi_modifyDate']
        });

        var updateparams = {
            ID: id,
            mi_modifyDate: store.get(1)
        };
        attributeObj = JSON.parse(store.get(0));
        docReq.fileName = attributeObj.origName;
        storeInfo = docReq.setBodyFromArrayBuffer(reqContent);

        updateparams[attribute] = storeInfo;

        store.run('update', {
            entity: entity,
            method: 'update',
            execParams: updateparams
        });
    } else {
        storeInfo = docReq.setBodyFromArrayBuffer(reqContent);
    }

    reqContent = null;
    return isNew;

};

provider.doMove = function (destination, overwrite) {
    // undefined - bad destanation
    // false - cannot overwrite
    // true - created
    // null - owerrided
    if (destination.length !== 4 || destination[0] !== entity || destination[1] !== attribute || destination[2] !== id) {
        throw new Error('invalid destination');
    }
    var
        res,
        destFileName = destination[3],
        destIsMain = destFileName.substr(0, 5) === 'main.',
        destGcKey = entity + '|' + attribute + '|' + id + '|' + destFileName,
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
    docReq.id = isMain ? id : tmp.id;
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
            lockType: 'ltTemp',
            ID: id,
            fieldList: [attribute, 'mi_modifyDate']
        });

        var prevFti = JSON.parse(store.get(0)),
            updateParams = {
                ID: id,
                mi_modifyDate: store.get(1)
            };

        docHandler.request.id = id;
        docHandler.content.fName = prevFti.fName;
        docHandler.content.origName = prevFti.origName;
        docHandler.saveContentToTempStore();
        docHandler.content.revision = prevFti.revision;
        docHandler.content.fName = prevFti.fName;
        docHandler.content.origName = prevFti.origName;
        updateParams[attribute] = JSON.stringify(docHandler.content);

        store.run('update', {
            entity: entity,
            method: 'update',
            execParams: updateParams
        });

        store.run('unlock', {
            entity: entity,
            method: 'unlock',
            ID: id
        });

        App.globalCachePut(gcKey, '');
//      delete temp from disk
//        provider.doDelete();
        return res;
    }

    throw new Error('todo');
};

provider.getLock = function (destination) {
    if (level < 4) return {};
    if (!isMain) {
        if (tmp.lock) {
            lock = {lockUser: tmp.lock};
        } else {
            return {};
        }
    } else {
        store.run('select', {
            entity: entity,
            method: 'select',
            ID: id,
            fieldList: ['ID']
        });

        store.run('isLocked', {
            entity: entity,
            method: 'isLocked',
            ID: id,
            fieldList: ['ID']
        });
        if (!store.lockResult)
            return {};

        var lock = JSON.parse(store.lockResult);
    }
    if (lock.lockType === 'None')
        return {};
    return {
        scope: 'exclusive',
        type: 'write',
        owner: lock.lockUser,
        depth: Infinity,
        timeout: 60,
        token: isMain ? id : tmp.id
    }
};

provider.doLock = function (lockObj) {
    lockObj.depth = Infinity;
    lockObj.timeout = 60;
    lockObj.token = isMain ? id : tmp.id;

    if (!isMain) {
        tmp.lock = Session.userID;
        App.globalCachePut(gcKey, JSON.stringify(tmp));
    } else {
        store.run('select', {
            entity: entity,
            method: 'select',
            ID: id,
            lockType: 'ltPersist',
            fieldList: ['ID']
        });
    }

    return lockObj;
};

provider.doUnLock = function (token) {
    if (isMain ? id : tmp.id == token) {
        if (!isMain) {
            tmp.lock = null;
            App.globalCachePut(gcKey, JSON.stringify(tmp));
        } else {
            store.run('unlock', {
                entity: entity,//'wd_document',
                method: 'unlock',
                ID: id
            });
        }
        return true;
    }
    return false;
};

provider.doDelete = function () {
    return false;
};

provider.doCreateDir = function () {
    return false;
};