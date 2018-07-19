/*globals udisk_permission, udisk_card, TubLoadContentBody, global*/
function udiskController(diskEntity) {

    var me = diskEntity,
        entityName = me.entity.name,
	    ENTITY_DIALECT = me.entity.connectionConfig ? me.entity.connectionConfig.dialect : '',
        permissionEntityName = me.entity.attributes.byName('name').customSettings.permissionEntityName,
        userRole = me.entity.attributes.byName('name').customSettings.userRole,
        adminRole = me.entity.attributes.byName('name').customSettings.adminRole,
        adminDCRole = me.entity.attributes.byName('name').customSettings.adminDenyContentRole,

    diskType = me.entity.attributes.byName('name').customSettings.diskType,
        permissionEntity = global[permissionEntityName];


     //entityName;
//me.entity.addMethod('selectAvailableToMe');
    me.entity.addMethod('changeAccess');
    me.entity.addMethod('checkNames');
    me.entity.addMethod('copy');
//me.entity.addMethod('delete');
    me.entity.addMethod('getAccessType');
    me.entity.addMethod('hasAccess');
    me.entity.addMethod('checkAccess');
    me.entity.addMethod('copyParentRight');

    me.entity.addMethod('adminSelect');
    me.entity.addMethod('adminDelete');
    me.entity.addMethod('adminUpdate');

    me.entity.addMethod('getDiskType');


    /*
     me.selectAvailableToMe = function(ctxt){

     if (!ctxt.mParams.whereList){
     ctxt.mParams.whereList = {};
     }
     ctxt.mParams.whereList.w1 = {
     expression: '[ID]',
     condition: 'subquery',
     subQueryType: 'notExists',
     values: {
     entity: permissionEntityName,
     fieldList: ['cardID', 'userID'],
     "whereList": {
     "w": {
     "expression": "[cardID] = udiskc.parentID",  // udiskc - sqlAlias from domainEntity
     "condition": "custom"
     },
     "wuser": {
     "expression": "[userID]",
     "condition": "equal",
     "values": {"userID": Session.userID}
     }
     }
     }
     };
     */

    function userHasRole(roleCode){
        var userRoleList = (Session.uData.roles || '').split(','), result = true;
        if (arguments.length > 1) {
            _.forEach(arguments, function (rc) {
                result = result && (userRoleList.indexOf(rc) >= 0);
                return result;
            });
            return result;
        } else {
            return userRoleList.indexOf(roleCode) >= 0;
        }
    }

    function userHasAnyRole(roleCode){
        var userRoleList = (Session.uData.roles || '').split(','), result = true;
        _.forEach(arguments, function (rc) {
            result = (userRoleList.indexOf(rc) >= 0);
            return !result;
        });
        return result;
    }

    me.adminSelect = function(ctxt){
        var params = ctxt.mParams,
            store =  ctxt.dataStore;
            //store = new TubDataStore(ctxt.mParams.entity),

        if (userHasAnyRole(adminRole, adminDCRole)) {
            params.__skipRls = true;
        } else {
            throw new Error('Access deny');
        }
        store.run('select', params);
        if (store.lockResult) {
            ctxt.mParams.resultLock = {};
            var rl = JSON.parse(store.lockResult);
            _.merge(ctxt.mParams.resultLock, rl);
        }
        //ctxt.dataStore.initFromJSON(store.asJSONObject);
        //ctxt.mParams.resultData = store.asJSONArray;
    };

    me.adminDelete = function(ctxt){
        var params = ctxt.mParams,
            //store =  ctxt.dataStore,
            cStore;

        if (userHasAnyRole(adminRole, adminDCRole)) {
            params.__skipRls = true;
            params.execParams.__skipRls = true;
        } else {
            throw new Error('Access deny');
        }
        cStore = UB.Repository(entityName)
            .attrs(['ID', 'isFolder'])
            .misc({__skipRls: true})
            .where('[ID]', '=', params.execParams.ID)
            .select();
        if (!cStore.get('isFolder')){
            throw new Error('<<<udiskCanChangeOnlyFolder>>>');
        }
        cStore = UB.Repository(entityName)
            .attrs(['ID', 'isFolder'])
            .misc({__skipRls: true})
            .where('[parentID]', '=', params.execParams.ID)
            .select();
        if (cStore.rowCount > 0){
            throw new Error('<<<udiskCanChangeOnlyEmptyFolder>>>');
        }

        store = new TubDataStore(entityName);
        store.execSQL('delete from ' + entityName + ' where id = :ID:', params.execParams )
        //store.run('delete', params);
    };

    me.adminUpdate = function(ctxt){
        var params = ctxt.mParams,
            store =  ctxt.dataStore,
            cStore;

        if (userHasAnyRole(adminRole, adminDCRole)) {
            params.__skipRls = true;
        } else {
            throw new Error('Access deny');
        }
        cStore = UB.Repository(entityName)
            .attrs(['ID', 'isFolder'])
            .misc({__skipRls: true})
            .where('[ID]', '=', params.execParams.ID)
            .select();
        if (!cStore.get('isFolder')){
            throw new Error('<<<udiskCanChangeOnlyFolder>>>');
        }
        cStore = UB.Repository(entityName)
            .attrs(['ID', 'isFolder'])
            .misc({__skipRls: true})
            .where('[parentID]', '=', params.execParams.ID)
            .select();
        if (cStore.rowCount > 0){
            throw new Error('<<<udiskCanChangeOnlyEmptyFolder>>>');
        }
        params.isAdminMode = true;
        /*
        store = new TubDataStore(entityName);
        if (params.execParams.name && params.execParams.ID) {
            store.execSQL('update ' + entityName + ' set name = :name: where id = :ID:', params.execParams)
        } else {
            throw  new Error('<<<udiskOnlyChangeNameSupportInAdminMode>>>');
        }
        */
        if (params.execParams.parentID) {
            throw new Error('<<<udiskCanChangeOnlyEmptyFolder>>>');
        }
        store.run('update', params);
    };



    me.checkNames = function (ctxt) {
        var execParams = ctxt.mParams.execParams,
            parentID = execParams.parentID,
            fileNames = execParams.fileNames,
            cStore, allFiles = {}, fileInfo, newName,
            resultData = [], resObj, suffix, srcFN, srcExt;


        cStore = UB.Repository(entityName).
            attrs(['ID', 'name', 'fsize', 'isFolder']).
            where('[parentID]', '=', parentID).
            select();

        while (!cStore.eof) {
            if (allFiles[cStore.get('name')] && allFiles[cStore.get('name')].isFolder) {
                cStore.next();
                continue;
            }
            allFiles[cStore.get('name')] = {
                ID: cStore.get('ID'),
                size: cStore.get('fsize'),
                isFolder: cStore.get('isFolder')
            };
            cStore.next();
        }
        _.forEach(fileNames, function (nameF) {
            srcFN = '';
            srcExt = '';
            if (nameF) {
                srcExt = nameF.split('.');
                srcFN = srcExt.shift();
                srcExt = srcExt.join('.');
            }
            fileInfo = allFiles[nameF];
            newName = '';
            resObj = {
                name: nameF,
                isTest: 123
            };
            if (fileInfo) {
                suffix = 0;
                do {
                    suffix++;
                    newName = srcFN + ' ' + suffix + '.' + srcExt;
                } while (allFiles[newName]);
                resObj.ID = fileInfo.ID;
                resObj.isFolder = fileInfo.isFolder;
                resObj.size = fileInfo.size;
                resObj.newName = newName;
            }
            resultData.push(resObj);
        });
        //ctxt.dataStore.initFromJSON(resultData);
        ctxt.mParams.resultInfo = JSON.stringify(resultData);
        cStore.freeNative();

    };


    function copyFileToNew(id, targetFolderID, name, isFolder, cStore) {
        var docHandlerSrc,
            docReq, docReqSrc, destID, eParams, content, cardStore;

        if (!isFolder) {
            docReqSrc = new TubDocumentRequest();
            docReqSrc.entity = entityName;
            docReqSrc.attribute = 'fileData';
            docReqSrc.id = id;
            docReqSrc.isDirty = false;
            docHandlerSrc = docReqSrc.createHandlerObject(true);
            docHandlerSrc.loadContent(TubLoadContentBody.Yes);
            //content = docReqSrc.getContent('bin');
        }
        destID = cStore.generateID();
        cStore.run('insert', {
                fieldList: ['ID', 'name', 'mi_modifyDate'],
                execParams: {
                    ID: destID,
                    name: name,
                    parentID: targetFolderID,
                    isFolder: !!isFolder,
                    isTemporary: false
                }
            }
        );
        eParams = {
            ID: destID,
            mi_modifyDate: cStore.get('mi_modifyDate')
        };

        if (isFolder) {
            cardStore = UB.Repository(entityName).
                attrs(['ID', 'name', 'isFolder']).
                where('[parentID]', '=', id).
                select();

            while (!cardStore.eof) {
                copyFileToNew(cardStore.get('ID'), destID, cardStore.get('name'), !!cardStore.get('isFolder'), cStore);
                cardStore.next();
            }
            cardStore.freeNative();
            return;
        }


        cStore.run('select', {
            entity: entityName,
            method: 'select',
            ID: destID,
            lockType: 'ltTemp',
            fieldList: ['ID']
        });


        docReq = new TubDocumentRequest();
        docReq.entity = entityName;
        docReq.attribute = 'fileData';
        docReq.fileName = name;
        docReq.origName = name;
        docReq.id = destID;
        docReq.isDirty = true;
        content = docReq.writeToTemp(docReqSrc);

        eParams.fileData = content; //docHandler.content
        cStore.run('update', {
                entity: entityName,
                fieldList: ["ID", 'name', 'fileData', 'mi_modifyDate'],
                execParams: eParams
            }
        );
        cStore.run('unlock', {
            entity: entityName,
            method: 'unlock',
            ID: destID,
            fieldList: ['ID']
        });

    }

    function lockEntity(id, withChild){
        var lockedArr = [id],
            store = new TubDataStore(entityName), lockRes;
        store.run('lock', {
            entity: entityName,
            method: 'lock',
            lockType: 'ltTemp',
            ID: id
        });
        //lockType: 'ltPersist',
        store.freeNative();
        if (!withChild){
            return lockedArr;
        }
        store = UB.Repository(entityName).
            attrs(['ID', 'name', 'isFolder', 'mi_modifyDate']).
            where('[parentID]', '=', id).
            select();
        try {
            while (!store.eof) {
                lockRes = lockEntity(store.get('ID'), true);
                lockedArr = lockedArr.concat(lockRes);
                store.next();
            }
        } finally{
            store.freeNative();
        }
        return lockedArr;
    }

    function unlockEntity(ids){
        var store = new TubDataStore(entityName);
        function doUnlock(id){
            store.run('unlock', {
                entity: entityName,
                method: 'unlock',
                ID: id,
                fieldList: ['ID']
            });
        }
        try {
            ids.forEach(doUnlock);
        } finally{
            store.freeNative();
        }
    }




    me.copy = function (ctxt) {
        var execParams = ctxt.mParams.execParams,
            fileNames = execParams.fileNames,
            selected = execParams.selected,
            action = execParams.action,
            targetFolderID = execParams.targetFolderID,
            sourceFolderID = execParams.sourceFolderID,
            cStore, cardStore, allFiles = {}, fileInfo,
            suffix, newName, srcFN, srcExt,
            newNames = [], ID, lockedIds;


        if (!selected || selected.length <= 0) {
            throw new Error('Invalid value of selected parameter');
        }
        if (!targetFolderID) {
            throw new Error('Invalid value of targetFolderID parameter');
        }
        cStore = new TubDataStore(entityName);
        if (action === 'cut') {
            if (sourceFolderID === targetFolderID) {
                return;
            }

            cardStore = UB.Repository(entityName).
                attrs(['ID', 'name', 'isFolder', 'mi_modifyDate']).
                where('[ID]', 'in', selected).
                select();

            while (!cardStore.eof) {
                lockedIds = lockEntity(cardStore.get('ID'), true);
                try {
                    cStore.run('update', {
                        fieldList: ['ID'],
                        caller: me.entity.name,
                        //lockType: 'ltTemp',
                        execParams: {
                            ID: cardStore.get('ID'),
                            mi_modifyDate: cardStore.get('mi_modifyDate'),
                            parentID: targetFolderID
                        }
                    });
                } finally {
                    unlockEntity(lockedIds);
                }
                cardStore.next();
            }
            cardStore.freeNative();
            cardStore = null;

            /*_.forEach(selected, function (sId) {
                cStore.run('update', {
                    fieldList: ['ID'],
                    caller: me.entity.name,
                    execParams: {
                        ID: sId,
                        parentID: targetFolderID
                    }
                });
            });*/
        }
        if (action === 'copy') {
            cardStore = UB.Repository(entityName).
                attrs(['ID', 'name', 'isFolder']).
                where('[parentID]', '=', targetFolderID).
                //where('[name]', 'in', fileNames).
                select();
            while (!cardStore.eof) {
                if (allFiles[cardStore.get('name')] && allFiles[cardStore.get('name')].isFolder) {
                    cardStore.next();
                    continue;
                }
                allFiles[cardStore.get('name')] = {
                    ID: cardStore.get('ID'),
                    isFolder: cardStore.get('isFolder')
                };
                cardStore.next();
            }
            cardStore.freeNative();
            cardStore = null;

            _.forEach(fileNames, function (fName, idx) {
                fileInfo = allFiles[fName];
                if (fileInfo) {
                    srcFN = '';
                    srcExt = '';
                    if (fName) {
                        srcExt = fName.split('.');
                        srcFN = srcExt.shift();
                        srcExt = srcExt.join('.');
                    }
                    suffix = 0;
                    do {
                        suffix++;
                        newName = srcFN + ' ' + suffix + '.' + srcExt;
                    } while (allFiles[newName]);
                    newNames[selected[idx]] = newName;
                    //newNames.push(newName);
                } else {
                    newNames[selected[idx]] = fName;
                    //newNames.push(fName);
                }

            });
            cardStore = UB.Repository(entityName).
                attrs(['ID', 'name', 'isFolder']).
                where('[ID]', 'in', selected).
                select();

            while (!cardStore.eof) {
                ID = cardStore.get('ID');
                copyFileToNew(ID, targetFolderID, newNames[ID], !!cardStore.get('isFolder'), cStore);

                cardStore.next();
            }
            cardStore.freeNative();
            cardStore = null;
            /*
             _.forEach(selected, function(sID, index) {

             copyFileToNew(sID, newNames[sID], cStore);
             });
             */

        }

    };

    me.changeAccess = function (ctxt) {
        var execParams = ctxt.mParams.execParams,
            allChild = execParams.allChild,
            action = execParams.action,
            accessType = execParams.accessType,
            cardStore, cStore, pStore, path, request;

        checkAccess(execParams.cardID, 'delegate');

        pStore = new TubDataStore(permissionEntityName);
        if (allChild) {
            cardStore = UB.Repository(entityName).
                attrs(['ID', 'mi_treePath']).
                where('[ID]', '=', execParams.cardID).
                select();

            if (cardStore.rowCount === 0) {
                throw new Error(UB.i18n('Invalid request'));
            }
            path = cardStore.get('mi_treePath');
            cardStore.freeNative();
            cardStore = null;
        }

        if (action === 'remove') {
            request = UB.Repository(permissionEntityName)
                .attrs(['ID'])
                .where('[userID]', '=', execParams.userID)
                .misc({__skipRls: true});

            if (allChild) {
                request.where('[cardID.mi_treePath]', 'startWith', path);
            } else {
                request.where('[cardID.parentID]', '=', execParams.cardID);
            }
            cStore = request.selectAsStore();
            while (!cStore.eof) {
                pStore.run('delete', {
                    fieldList: [],
                    caller: me.entity.name,
                    execParams: {
                        ID: cStore.get('ID')
                    }
                });
                cStore.next();
            }
            cStore.freeNative();
        } else {
            request = UB.Repository(permissionEntityName)
                .attrs(['ID'])
                .where('accessType', '!=', accessType)
                .misc({__skipRls: true});
            if (allChild) {
                request.where('cardID.mi_treePath', 'startWith', path);
            } else {
                request.where('cardID.parentID', '=', execParams.cardID);
            }
            cStore = request.select();
            while (!cStore.eof) {
                pStore.run('delete', {
                    fieldList: ['ID'],
                    caller: me.entity.name,
                    execParams: {
                        ID: cStore.get('permission.ID')
                    }
                });
                cStore.next();
            }
            cStore.freeNative();

            request = UB.Repository(entityName)
                .attrs(['ID'])
                .misc({__skipRls: true});
            if (allChild) {
                request.where('[mi_treePath]', 'startWith', path);
            } else {
                request.where('[parentID]', '=', execParams.cardID);
            }
            cStore = request.select();

            while (!cStore.eof) {
                pStore.run('insert', {
                    fieldList: ['ID'],
                    caller: me.entity.name,
                    execParams: {
                        cardID: cStore.get('ID'),
                        userID: execParams.userID,
                        accessType: accessType
                    }
                });

                cStore.next();
            }
            cStore.freeNative();
        }
    };
	

    me.limitByUser = function() {
        if (Session.userID === -99 || !Session.userID) {
            return '(1 = 1)';
        }

    if (userHasRole(adminDCRole)){
        return '1=0';
    }
        //Session.uData.roleIDs.concat(Session.userID)
	if (ENTITY_DIALECT === TubSQLDialect.SQLite3) {
          return 'exists( select 1 from ' + permissionEntityName + ' rlsPerm where rlsPerm.cardID = [ID] and rlsPerm.userID in (' + Session.uData.roleIDs.concat(Session.userID).join(',') + ') )';
	} else {
          return 'exists( select 1 from ' + permissionEntityName + ' rlsPerm where rlsPerm.cardID = [ID] ' +
            ' and  exists ( (select 1 from uba_userrole ur where ur.userID = :(' + Session.userID + '): and ur.roleID = rlsPerm.userID) union all ' +
            ' (select 1 from uba_user u where u.id = :(' + Session.userID + '): and u.id = rlsPerm.userID )))';
	}
    };

    /**
     * return priority level of accessType
     * @param {String} accessType
     * @returns {number}
     */
    function accessTypePriority(accessType) {
        switch (accessType) {
            case 'owner':
                return 4;
            case 'delegate':
                return 3;
            case 'write':
                return 2;
            case 'read':
                return 1;
            default:
                return 0;
        }
    }

    /**
     * return true if "first" > "second"
     * @param {String} first
     * @param {String} second
     * @returns {boolean}
     */
    function compareAccessType(first, second) {
        return (accessTypePriority(first) > accessTypePriority(second));
    }

    /**
     * check access for all items in path
     * @param {Number} ID
     * @param {String} accessType
     * @param {Object} [details] output details.accessType
     * @returns {boolean}
     */
    function hasFullAccess(ID, accessType, details) {
        var store, path, fs, es, rights = {}, prev, aType, result = true;

        if (!Session.userID || !Session.uData || !Session.uData.roleIDs) {
            return false;
        }

        store = UB.Repository(entityName).
            attrs(['ID', 'mi_treePath']).
            where('[ID]', '=', ID).
            select();
        if (store.rowCount === 0) {
            return false;
        }
        path = store.get('mi_treePath');
        store.freeNative();

        fs = path[0] === '/';
        es = path[path.length - 1] === '/';
        if (fs || es) {
            path = path.substr(fs ? 1 : 0, path.length - (fs ? 1 : 0) - (es ? 1 : 0));
        }
        path = path.split('/').map(function (item) {
            return parseInt(item);
        });
        path.push(ID);


        store = UB.Repository(permissionEntityName).
            attrs(['cardID', 'accessType']).
            where('[userID]', 'in', Session.uData.roleIDs.concat(Session.userID)).
            where('[cardID]', 'in', path).
            select();

        while (!store.eof) {
            aType = store.get('accessType');
            prev = rights[store.get('cardID')];
            if (!prev) {
                rights[store.get('cardID')] = aType;
            }
            if (prev && compareAccessType(aType, prev)) {
                rights[store.get('cardID')] = aType;
            }
            store.next();
        }
        store.freeNative();

        if (details) {
            details.accessType = rights[ID];
        }

        _.forEach(path, function (itemID) {
            if (!rights[itemID]) {
                result = false;
                return false;
            }

            if (itemID === ID && compareAccessType(accessType, rights[itemID])) {
                result = false;
                return false;
            }
        });
        return result;
    }

    me.hasFullAccess = hasFullAccess;


    /**
     *
     * @param {Number} ID
     * @returns {String} accessType
     */
    function getAccessType(ID) {
        var store, accessType, priority = -1, pTmp, result = null;

        store = new TubDataStore(permissionEntityName);
        store.runSQL('select p.accessType from ' + permissionEntityName + ' p where p.cardID = :ID: and exists ' +
        '(select 1 from uba_userrole ur where p.userID = ur.roleID and ur.userID = :userID: ' +
        ' union all select 1 from uba_user u where p.userID = u.ID and u.ID = :userID: ) ', {
            ID: ID,
            userID: Session.userID
        });

        while (!store.eof) {
            accessType = store.get('accessType');
            pTmp = accessTypePriority(accessType);
            if (priority < pTmp) {
                result = accessType;
                priority = pTmp;
            }
            store.next();
        }
        return result;
    }

    me.getDiskType = function (ctxt) {
        ctxt.mParams.diskType = diskType || '';
    };

    me.getAccessType = function (ctxt) {
        var ID = ctxt.mParams.ID;
        ctxt.mParams.accessType = getAccessType(ID);
    };

    me.hasAccess = function (ctxt) {
        var ID = ctxt.mParams.ID,
            accessType = ctxt.mParams.accessType;
        if (!ID) {
            ctxt.mParams.hasAccess = userHasAnyRole(adminRole, adminDCRole);
            return;
        }
        ctxt.mParams.hasAccess = hasFullAccess(ID, accessType);
        //!compareAccessType(accessType, getAccessType(ID));
    };

    me.checkAccess = function (ctxt) {
        var ID = ctxt.mParams.ID,
            accessType = ctxt.mParams.accessTyperoles;
        if (!ID) {
            ctxt.mParams.hasAccess = userHasAnyRole(adminRole, adminDCRole);
            return;
        }
        //compareAccessType(accessType, getAccessType(ID))
        if (!hasFullAccess(ID, accessType)) {
            throw new Error(UB.i18n('accessDeny'));
        }
    };


    function checkAccess(ID, accessType) {
        //compareAccessType(accessType, getAccessType(ID))
        if (!hasFullAccess(ID, accessType)) {
            throw new Error(UB.i18n('accessDeny'));
        }
    }

    me.on('insert:before', function (ctxt) {
        var execParams = ctxt.mParams.execParams, fInfo, roles, adminMode;
        if (!Session.userID || Session.userID < 0) {
            throw new Error(UB.i18n('accessDeny'));
        }
        adminMode = ctxt.mParams.mode === 'admin' && userHasAnyRole(adminRole, adminDCRole);
        execParams.ownerID = Session.userID;
        if (execParams.fileData) {
            fInfo = JSON.parse(execParams.fileData);
            execParams.fsize = parseInt(fInfo.size);
            execParams.contentType = fInfo.ct;
        }
        if (!adminMode && execParams.parentID) {
            checkAccess(execParams.parentID, 'write');
        } else {
            if (!userHasAnyRole(adminRole, adminDCRole)) {
                throw new Error(UB.i18n('accessDeny'));
            }

        }
    });

    me.on('update:before', function (ctxt) {
        var execParams = ctxt.mParams.execParams, fInfo, store,
            oldParentID, adminMode;
        if (!Session.userID || Session.userID < 0) {
            throw new Error(UB.i18n('accessDeny'));
        }
        if (execParams.ownerID) {
            throw Error('You can not change the owner');
        }
        if (diskType === 'secret') {
            adminMode = ctxt.mParams.mode === 'admin' && userHasAnyRole(adminRole, adminDCRole);
            if (adminMode) {
                throw new Error(UB.i18n('accessDeny'));
            }
        }

        if (execParams.fileData) {
            fInfo = JSON.parse(execParams.fileData);
            execParams.fsize = parseInt(fInfo.size);
            execParams.contentType = fInfo.ct;
        }
        if ( ctxt.externalCall || (!ctxt.externalCall && !ctxt.mParams.isAdminMode)) {
            if (execParams.ID) {
                checkAccess(execParams.ID, 'write');
            } else {
                throw new Error(UB.i18n('accessDeny'));
            }
        }

        if (execParams.parentID) {
            // check move
            store = UB.Repository(entityName).
                attrs(['ID', 'parentID']).
                misc({__skipRls: true}).
                where('[ID]', '=', execParams.ID).select();
            oldParentID = store.get('parentID');
            if (execParams.parentID !== oldParentID) {
                checkAccess(execParams.parentID, 'write');
                deleteInheritRight(execParams.ID);
            }
            store.freeNative();
        }
    });

    me.on('update:after', function (ctxt) {
        var execParams = ctxt.mParams.execParams, store, isFolder;
        if (!Session.userID || Session.userID < 0) {
            throw new Error(UB.i18n('accessDeny'));
        }
        if (execParams.parentID) {
            store = UB.Repository(entityName).
                attrs(['ID','isFolder']).
                where('[ID]', '=', execParams.ID).select();
            isFolder = store.get('isFolder');
            store.freeNative();
            if (!isFolder) {
                copyInheritRight(execParams.ID, execParams.parentID);
            }
        }
    });

    /**
     *
     * @param {Number}ID
     */
    function deleteInheritRight(ID) {
        var store,
            pStore = new TubDataStore(permissionEntityName);
        store = UB.Repository(permissionEntityName).
            attrs(['ID']).
            where('[cardID]', '=', ID).
            where('[parentID]', 'isNotNull').
            select();
        while (!store.eof) {
            pStore.run('delete', {
                fieldList: ['ID'],
                caller: me.entity.name,
                skipDelegate: true,
                execParams: {
                    ID: store.get('ID')
                }
            });
            store.next();
        }
        store.freeNative();
        pStore.freeNative();
    }

    /**
     *
     * @param {Number} ID
     * @param {Number} [parentID]
     */
    function copyInheritRight(ID, parentID) {
        var store, store2,
            pStore = new TubDataStore(permissionEntityName);

        if (!parentID) {
            store = UB.Repository(entityName).
                attrs(['ID']).
                where('[ID]', '=', ID).select();
            parentID = store.get('parentID');
            store.freeNative();
        }

        store = UB.Repository(permissionEntityName).
            attrs(['ID', 'userID', 'accessType']).
            where('[cardID]', '=', parentID).
            select();

        while (!store.eof) {
            store2 = UB.Repository(permissionEntityName).
                attrs(['ID']).
                where('[cardID]', '=', ID).
                where('[parentID]', '=', store.get('ID')).
                select();
            if (store2.rowCount === 0) {
                pStore.run('insert', {
                    fieldList: ['ID'],
                    caller: me.entity.name,
                    skipDelegate: true,
                    execParams: {
                        parentID: store.get('ID'),
                        userID: store.get('userID'),
                        cardID: ID,
                        accessType: store.get('accessType')
                    }
                });
            }
            store2.freeNative();
            store.next();
        }
        store.freeNative();
        pStore.freeNative();
    }


    me.on('beforedelete:before', function (ctxt) {
        var execParams = ctxt.mParams.execParams,
            adminMode = ctxt.mParams.mode === 'admin' && userHasAnyRole(adminRole, adminDCRole),
            store;
        if (!Session.userID || Session.userID < 0) {
            throw new Error(UB.i18n('accessDeny'));
        }
        if (adminMode){
            store = UB.Repository(entityName).
                attrs(['ID','isFolder']).
                misc({__skipRls: true}).
                where('[ID]', '=', execParams.ID).select();
            if (store.get('isFolder')){
                return;
            }
            store.freeNative();
        }

        if (execParams.ID) {
            checkAccess(execParams.ID, 'write');
        } else {
            throw new Error(UB.i18n('accessDeny'));
            //throw new Error('method delete must use ID parameter');
        }

    });

    me.on('delete:before', function (ctxt) {
        var execParams = ctxt.mParams.execParams, store, pStore;
        store = UB.Repository(entityName)
            .attrs(['ID'])
            .misc({__skipRls: true})
            .where('[parentID]', '=', execParams.ID).select();
        pStore = new TubDataStore(entityName);

        while (!store.eof) {
            try {
                pStore.run('delete', {
                    fieldList: ['ID'],
                    caller: me.entity.name,
                    skipDelegate: true,
                    execParams: {
                        ID: store.get('ID')
                    }
                });
            } catch (err){
                throw new Error('<<<udiskDeleteFiledNoAccessToChild>>>')
            }
            store.next();
        }
        store.freeNative();
        pStore.freeNative();


        store = UB.Repository(permissionEntityName)
            .attrs(['ID'])
            .misc({__skipRls: true})
            .where('[cardID]', '=', execParams.ID).select();
        pStore = new TubDataStore(permissionEntityName);

        while (!store.eof) {
            try {
                pStore.run('delete', {
                    fieldList: ['ID'],
                    caller: me.entity.name,
                    skipDelegate: true,
                    execParams: {
                        ID: store.get('ID')
                    }
                });
            } catch (err){
                throw new Error('<<<udiskDeleteFiledNoAccessToChild>>>')
            }
            store.next();
        }
        store.freeNative();
        pStore.freeNative();
    });


    me.on('afterinsert:before', function (ctxt) {
        var execParams = ctxt.mParams && ctxt.mParams.execParams,
            ownerID = execParams && execParams.ownerID,
            ID = execParams && execParams.ID,
            parentID = execParams && execParams.parentID,
            isFolder = execParams && execParams.isFolder,
            pStore, cStore, adminMode;

        adminMode = ctxt.mParams.mode === 'admin' && userHasAnyRole(adminRole, adminDCRole);

        if (!adminMode) { // in admin mode new object do not get the right
            pStore = new TubDataStore(permissionEntityName);
            pStore.run('insert', {
                    fieldList: [],
                    caller: me.entity.name,
                    skipDelegate: true,
                    execParams: {
                        cardID: ID,
                        userID: ownerID,
                        accessType: diskType === 'secret' ? 'write' : 'owner'
                    }
                }
            );
        }

        if (!isFolder) {
            cStore = UB.Repository(permissionEntityName).
                attrs(['ID', 'userID', 'accessType']).
                where('[cardID]', '=', parentID).
                select();
            while (!cStore.eof) {
                if (cStore.get('accessType') !== 'owner') {
                    pStore.run('insert', {
                            fieldList: [],
                            caller: me.entity.name,
                            skipDelegate: true,
                            execParams: {
                                cardID: ID,
                                userID: cStore.get('userID'),
                                accessType: cStore.get('accessType'),
                                parentID: cStore.get('ID')
                            }
                        }
                    );
                }

                cStore.next();
            }
            cStore.freeNative();
            cStore = null;
        }


    });


    /*

     function synchroniseAccess(ctxt, action){
     var execParams = ctxt.mParams && ctxt.mParams.execParams,
     pStore,
     udisk_card, cStore, cStore2,
     ID = execParams.ID,
     cardID,
     userID, oldUserID,
     accessType = execParams.accessType,
     oldAccessType;

     if (action === 'insert') {
     cardID = execParams.cardID;
     userID = execParams.userID;
     } else {
     udisk_card = UB.Repository(permissionEntityName).
     attrs(['ID', 'userID', 'cardID', 'accessType']).
     where('[ID]', '=', ID).
     select();
     cardID = udisk_card.get('cardID');
     userID = udisk_card.get('userID');
     oldAccessType = udisk_card.get('accessType');
     if (execParams.userID && execParams.userID !== userID){
     oldUserID = userID;
     userID = execParams.userID;
     }
     udisk_card.freeNative();
     }

     if (accessType === 'owner'){
     return;
     }
     udisk_card = UB.Repository(entityName).
     attrs(['ID', 'isFolder', 'parentID', 'mi_treePath']).
     where('[ID]', '=', cardID).
     select();

     if (udisk_card.get('isFolder')) {
     // для всех подчинненых файлов ставим те же права
     pStore = new TubDataStore(permissionEntityName);
     cStore = UB.Repository(entityName).
     attrs(['ID']).
     where('[parentID]', '=', cardID).
     where('[isFolder]', '!=', true).
     select();
     while (!cStore.eof){
     if (oldUserID) {
     cStore2 = UB.Repository(permissionEntityName).
     attrs(['ID', 'userID', 'cardID', 'accessType']).
     where('[cardID]', '=', cStore.get('ID')).
     where('[userID]', '=', oldUserID).
     select();
     if (cStore2.rowCount > 0 && !compareAccessType(cStore2.get('accessType'), accessType) ){
     pStore.run('delete', {
     fieldList: [],
     caller: me.entity.name,
     execParams: {
     ID: cStore2.get('ID')
     }
     }
     );
     }
     cStore2.freeNative();
     }
     cStore2 = UB.Repository(permissionEntityName).
     attrs(['ID', 'userID', 'cardID', 'accessType']).
     where('[cardID]', '=', cStore.get('ID')).
     where('[userID]', '=', userID).
     select();
     if (cStore2.rowCount > 0 && !compareAccessType(cStore2.get('accessType'), oldAccessType)){
     if (action === 'delete'){
     pStore.run('delete', {
     fieldList: [],
     caller: me.entity.name,
     execParams: {
     ID: cStore2.get('ID')
     }
     }
     );
     } else {
     pStore.run('update', {
     fieldList: [],
     caller: me.entity.name,
     execParams: {
     ID: cStore2.get('ID'),
     accessType: accessType
     }
     }
     );
     }
     } else {
     if (action !== 'delete'){
     pStore.run('insert', {
     fieldList: [],
     caller: me.entity.name,
     execParams: {
     cardID: cStore.get('ID'),
     userID: userID,
     accessType: accessType
     }
     }
     );
     }
     }
     cStore2.freeNative();

     cStore.next();
     }
     cStore.freeNative();
     }
     udisk_card.freeNative();
     }
     */
    function checkDelegate(ctxt) {
        var execParams = ctxt.mParams && ctxt.mParams.execParams, cStore,
            ID = execParams.ID, cardID = execParams.cardID, parentID = -1;
        if (cardID) {
            cStore = UB.Repository(entityName).
                attrs(['ID', 'parentID']).
                where('[ID]', '=', cardID).
                misc({__skipRls: true}).
                select();
            if (cStore.rowCount > 0) {
                parentID = cStore.get('parentID');
            }
        } else {
            cStore = UB.Repository(permissionEntityName).
                attrs(['ID', 'cardID.parentID']).
                where('[ID]', '=', ID).
                misc({__skipRls: true}).
                select();
            if (cStore.rowCount > 0) {
                parentID = cStore.get('cardID.parentID');
            }
        }
        if (!parentID) {
            return;
        }
        checkAccess(parentID, 'delegate');
    }

    function checkCardDelegate(ctxt) {
        var execParams = ctxt.mParams && ctxt.mParams.execParams, cStore,
            ID = execParams.ID, cardID = execParams.cardID;
        if (userHasAnyRole(adminRole, adminDCRole)){
            return true;
        }
        if (!cardID) {
            cStore = UB.Repository(permissionEntityName).
                attrs(['ID', 'cardID']).
                where('[ID]', '=', ID).
                misc({__skipRls: true}).
                select();
            if (cStore.rowCount > 0) {
                cardID = cStore.get('cardID');
            }
        }
        checkAccess(cardID, 'delegate');
    }


    permissionEntity.on('insert:before', function (ctxt) {
        var execParams = ctxt.mParams && ctxt.mParams.execParams;
        if (!Session.userID || Session.userID < 0) {
            throw new Error(UB.i18n('accessDeny'));
        }
        if (!ctxt.externalCall && ctxt.mParams.skipDelegate) {
            return;
        }
        if (ctxt.externalCall && execParams.parentID) {
            throw new Error(UB.i18n('accessDeny'));
        }
        checkCardDelegate(ctxt);
    });

    me.copyParentRight = function (ctxt) {
        var ID = ctxt.mParams.ID, parentID,
            store, store2,
            pStore = new TubDataStore(permissionEntityName);

        if (!ID) {
            throw new Error('Invalid parameters');
        }
        checkAccess(ID, 'delegate');

        store = UB.Repository(entityName).
            attrs(['ID', 'parentID']).
            where('[ID]', '=', ID).select();
        parentID = store.get('parentID');
        store.freeNative();

        if (!parentID) {
            return;
        }

        store = UB.Repository(permissionEntityName).
            attrs(['ID', 'userID', 'accessType']).
            where('[accessType]', '!=', 'owner').
            where('[cardID]', '=', parentID).
            select();

        while (!store.eof) {
            store2 = UB.Repository(permissionEntityName).
                attrs(['ID']).
                where('[cardID]', '=', ID).
                where('[userID]', '=', store.get('userID')).
                where('[accessType]', '=', store.get('accessType')).
                select();
            if (store2.rowCount === 0) {
                pStore.run('insert', {
                    fieldList: ['ID'],
                    caller: me.entity.name,
                    skipDelegate: true,
                    execParams: {
                        userID: store.get('userID'),
                        cardID: ID,
                        accessType: store.get('accessType')
                    }
                });
            }
            store2.freeNative();
            store.next();
        }
        store.freeNative();
        pStore.freeNative();

    };

    /*
     function checkAccessToParent(permissionID, cardID){
     store = UB.Repository(permissionEntityName).
     attrs(['ID']).
     where('[parentID]', '=', cardID).
     where('[isFolder]', '!=', true).
     select();

     }
     */

    /**
     * Check access right to folder before add access to the child folders or files
     * @param cardID
     * @param subjectID
     */
    function checkParentAccess(cardID, subjectID) {
        var store, parentID;
        if (userHasAnyRole(adminRole, adminDCRole)){
            return true;
        }
        store = UB.Repository(entityName).
            attrs(['ID', 'parentID']).
            where('[ID]', '=', cardID).
            select();
        parentID = store.get('parentID');
        store.freeNative();
        if (!parentID) {
            return;
        }

        store = new TubDataStore(permissionEntityName);
        store.runSQL(
            // user - user role - role
            'select p.accessType from ' + permissionEntityName + ' p where p.cardID = :cardID: and p.userID = :userID: ' +
            ' union all ' +
                // role - user
            'select p.accessType from ' + permissionEntityName + ' p ' +
            ' inner join uba_userrole ur on p.userID = ur.roleID where p.cardID = :cardID: and ur.userID = :userID: ',
            {cardID: parentID, userID: subjectID}
        );
        if (store.rowCount > 0) {
            store.freeNative();
            return;
        }

        /*
         store.runSQL(
         // role - sub role
         ' select 1 from uba_userrole ur where ur.roleID = :userID: and not exists(' +
         ' select 1 from ' + permissionEntityName + ' p inner join uba_userrole ur1 on p.userID = ur1.roleID ' +
         '  where p.cardID = :cardID: and ur1.userID  = ur.userID )' +
         ' union all '+
         // user - role
         ' select 1 from uba_userrole ur where ur.roleID = :userID: and not exists(' +
         ' select 1 from ' + permissionEntityName + ' p ' +
         '  where p.cardID = :cardID: and p.userID  = ur.userID )',
         {cardID: parentID, userID:  subjectID}
         );
         if (store.rowCount === 0){
         store.freeNative();
         return;
         }
         */
        store.freeNative();
        throw new Error(UB.i18n('udiskUserMustHaveAccessToParent'));

    }

    /**
     * check access right to the child folders and files before right will be deleted
     * @param {Number} cardID  Folder ID
     * @param {Number} itemID  The permission ID that will be deleted
     */
    function checkChildAccess(cardID, itemID) {
        var store;
        if (userHasAnyRole(adminRole, adminDCRole)){
            return true;
        }
        store = new TubDataStore(permissionEntityName);

        store.runSQL(
            'select 1 from ' + entityName + ' c where c.parentID = :cardID: and exists(' +
            'SELECT 1 FROM ' + permissionEntityName + ' p WHERE p.cardID = c.id ' +
            ' AND p.parentID IS NULL and not exists( ' +
            ' select 1 from ' + permissionEntityName + ' pp ' +
            ' where pp.userID = p.userID ' +
            ' AND pp.cardID = :cardID: ' +
            ' AND pp.id <> :itemID: ' +
            '))',
            {cardID: cardID, itemID: itemID}
        );
        if (store.rowCount === 0) {
            store.freeNative();
            return;
        }

        store.runSQL(
            'select 1 from ' + entityName + ' c where c.parentID = :cardID: and exists(' +
            'SELECT 1 FROM ' + permissionEntityName + ' p WHERE p.cardID = c.id ' +
            ' AND p.parentID IS NULL and not exists( ' +
            ' select 1 from ' + permissionEntityName + ' pp ' +
            ' inner join uba_userrole rp on pp.userID = rp.roleID ' +
            ' where rp.userID = p.userID ' +
            ' AND pp.cardID = :cardID: ' +
            ' AND pp.id <> :itemID: ' +
            '))',
            {cardID: cardID, itemID: itemID}
        );
        if (store.rowCount === 0) {
            store.freeNative();
            return;
        }

        store.freeNative();
        throw new Error(UB.i18n('udiskUserMustHaveAccessToParent'));

    }


    permissionEntity.on('afterinsert:before', function (ctxt) {
        // synchroniseAccess(ctxt, 'insert');
        var execParams = ctxt.mParams && ctxt.mParams.execParams, permStore, cStore,
            cardID = execParams.cardID, udisk_card;

        if (!ctxt.externalCall && ctxt.mParams.skipDelegate) {
            return;
        }

        if (diskType === 'secret' && !((execParams.accessType === 'read') || (execParams.accessType === 'write')) ){
            throw new Error('Invalid access type');
        }
        if (!execParams.parentID) { // not inherited
            checkParentAccess(execParams.cardID, execParams.userID);
        }

        udisk_card = UB.Repository(entityName).
            attrs(['ID', 'isFolder', 'parentID', 'mi_treePath']).
            where('[ID]', '=', cardID).
            select();

        if (udisk_card.get('isFolder')) {
            // для всех подчинненых файлов ставим те же права
            permStore = new TubDataStore(permissionEntityName);
            cStore = UB.Repository(entityName).
                attrs(['ID']).
                where('[parentID]', '=', cardID).
                where('[isFolder]', '!=', true).
                select();
            while (!cStore.eof) {
                permStore.run('insert', {
                        fieldList: [],
                        caller: me.entity.name,
                        skipDelegate: true,
                        execParams: {
                            accessType: execParams.accessType,
                            userID: execParams.userID,
                            parentID: execParams.ID,
                            cardID: cStore.get('ID')
                        }
                    }
                );
                cStore.next();
            }
            cStore.freeNative();
        }
        udisk_card.freeNative();
    });

    permissionEntity.on('delete:before', function (ctxt) {
        if (!Session.userID || Session.userID < 0) {
            throw new Error(UB.i18n('accessDeny'));
        }
        var execParams = ctxt.mParams && ctxt.mParams.execParams,
            ID = execParams.ID, cStore;
        if (!ctxt.externalCall && ctxt.mParams.skipDelegate) {
            return;
        }
        if (ctxt.externalCall && !userHasAnyRole(adminRole, adminDCRole)) {
            cStore = UB.Repository(permissionEntityName).
                attrs(['ID', 'cardID', 'parentID', 'accessType']).
                where('[ID]', '=', ID).
                misc({__skipRls: true}).
                select();
            if (cStore.rowCount > 0 && (cStore.get('parentID') || (cStore.get('accessType') === 'owner'))) {
                throw new Error(UB.i18n('accessDeny'));
            }
            if (cStore.rowCount > 0) {
                checkChildAccess(cStore.get('cardID'), cStore.get('ID'));
            }
            cStore.freeNative();
            cStore = null;
        }

        /*
         cStore = UB.Repository(permissionEntityName).
         attrs(['ID', 'userID']).
         where('[ID]', '=', ID).
         where('[userID]', '=', Session.userID).
         misc({__skipRls: true}).
         select();
         if (cStore.rowCount !== 1) {
         checkDelegate(ctxt);
         }*/
        checkCardDelegate(ctxt);

        // inherited access drop "cascade delete"
        //synchroniseAccess(ctxt, 'delete');
    });

    permissionEntity.on('update:before', function (ctxt) {
        var cStore, execParams = ctxt.mParams && ctxt.mParams.execParams,
            ID = execParams.ID, permStore, updParams;

        if (!ctxt.externalCall && ctxt.mParams.skipDelegate) {
            return;
        }
        if (!Session.userID || Session.userID < 0) {
            throw new Error(UB.i18n('accessDeny'));
        }
        if (ctxt.externalCall && execParams.parentID) {
            throw new Error(UB.i18n('accessDeny'));
        }
        if (diskType === 'secret' && execParams.accessType &&
             !((execParams.accessType === 'read') || (execParams.accessType === 'write')) ){
            throw new Error('Invalid access type');
        }
        if (ctxt.externalCall && userHasAnyRole(adminRole, adminDCRole)) {
            cStore = UB.Repository(permissionEntityName).
                attrs(['ID', 'cardID', 'parentID']).
                //where('[parentID]', 'notIsNull').
                where('[ID]', '=', ID).
                misc({__skipRls: true}).
                select();
            if ((cStore.rowCount > 0) && (cStore.get('parentID') )) {
                throw new Error(UB.i18n('accessDeny'));
            }
            //if ((cStore.rowCount > 0) && (cStore.get('accessType') === 'owner')  ) {
            //}
            if ((cStore.rowCount > 0) && execParams.userID) {
                checkParentAccess(cStore.get('cardID'), execParams.userID);
                checkChildAccess(cStore.get('cardID'), ID);
            }

            cStore.freeNative();
            cStore = null;
        }
        checkCardDelegate(ctxt);
        //checkDelegate(ctxt);
        //synchroniseAccess(ctxt, 'update');

        //update all child
        permStore = new TubDataStore(permissionEntityName);
        updParams = {};
        if (execParams.accessType) {
            updParams.accessType = execParams.accessType;
        }
        if (execParams.userID) {
            updParams.userID = execParams.userID;
        }
        cStore = UB.Repository(permissionEntityName)
            .attrs(['ID', 'parentID', 'mi_modifyDate'])
            .where('[parentID]', '=', ID)
            .misc({__skipRls: true})
            .select();
        while (!cStore.eof) {
            updParams.ID = cStore.get('ID');
            updParams.mi_modifyDate = cStore.get('mi_modifyDate');
            permStore.run('update', {
                    fieldList: [],
                    caller: me.entity.name,
                    skipDelegate: true,
                    execParams: updParams
                }
            );
            cStore.next();
        }
        cStore.freeNative();
        permStore.freeNative();

    });
}

module.exports = udiskController;