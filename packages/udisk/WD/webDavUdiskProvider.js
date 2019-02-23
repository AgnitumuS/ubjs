/**
 * Created by xmax
 *
 * WebDav UDISK provider.
 *
 * Usage: \\host[@ssl]@port\UDISK\entity\id\Name
 * Example \\localhost@888\UDISK\udisk_card\10006123456001\party.jpeg
 *
 */
/* global TubLoadContentBody, require */

(function () {
  var provider = {name: 'udisk'} // exports;
  /**
     * Set path from request. This method calls in every new request.
     * @param path
     */
  provider.setPath = function (path) {
    var me = this, level = path.length
    me.attribute = 'fileData'
    me.level = level

    me.store = null
    me.record = null
    me.tempRecord = null
    me.entity = null
    me.id = null
    me.fileName = null
    me.storedId = null

    me.currentName = null

    if (level !== 3) {
      return
      // throw new Error('Invalid path for WebDav provider');
    }
    me.entity = path[0]
    me.id = parseInt(path[1])
    me.fileName = path[2]

    // if (!Session.userID){
    // console.log(' ---- empty Session.userID  ');
    // Session.setUser(-99); // 10
    // }
    me.record = UB.Repository(me.entity)
      .attrs(['ID', 'name', 'parentID', 'isFolder', 'ownerID', 'fsize', 'contentType', 'isTemporary', 'fileData',
        'mi_treePath', 'mi_createDate', 'mi_modifyDate'])
      .where('[ID]', '=', me.id)
      .select()

    if (me.record.rowCount === 0) {
      throw new Error('File does not exists')
    }
    me.currentName = me.record.get('name')
    me.isTemp = me.currentName !== me.fileName
    me.isNewTemp = false
    me.storedId = me.id

    var accessOptions = {}
    me.canWrite = false
    me.canRead = false
    if (Session.userID) {
      if (!global[me.entity].hasFullAccess(me.id, 'read', accessOptions)) {
        throw new Error('Acess deny')
      }
      me.canRead = true
      me.canWrite = accessOptions.accessType && accessOptions.accessType !== 'read'
    }
    // me.canWrite = udisk_card.hasFullAccess(me.id, 'write');

    me.store = new TubDataStore(me.entity)
    if (me.isTemp) {
      me.isNewTemp = true
      me.tempRecord = UB.Repository(me.entity)
        .attrs(['ID', 'name', 'parentID', 'isFolder', 'ownerID', 'fsize', 'contentType', 'isTemporary', 'fileData', 'mi_treePath'])
        .where('[parentID]', '=', me.id)
        .where('[name]', '=', me.fileName)
        .select()
      if (me.tempRecord.rowCount === 0) {
        me.tempId = me.store.generateID()
      } else {
        me.isNewTemp = false
        me.tempId = me.tempRecord.get('ID')
      }
      me.storedId = me.tempId

      /*
            store.run('addNew',{
                    fieldList: ['ID', 'name', 'parentID'],
                    entity: me.entity
                }
            );
            */
    }
  }

  provider.finalize = function (req, resp, options) {
    var me = this

    if (me.record) {
      me.record.freeNative()
    }
    if (me.tempRecord) {
      me.tempRecord.freeNative()
    }
    if (me.store) {
      me.store.freeNative()
    }

    me.level = 0
    me.store = null
    me.record = null
    me.tempRecord = null

    me.entity = null
    me.id = null
    me.fileName = null
    me.storedId = null
    me.currentName = null
  }

  /**
     * Is current path exists
     * @return {boolean}
     */
  provider.exists = function () {
    return (this.level < 3) || // for not full path
            ((this.record && this.record.rowCount > 0) && (this.isTemp ? !this.isNewTemp : true))
  }

  provider.allProperties = {
    'DAV:': {
      'getlastmodified': {},
      'creationdate': {},
      'getcontentlength': {},
      'resourcetype': {},
      'getetag': {},
      'supportedlock': {},
      // 'ishidden': {},
      // 'displayname': {},
      // 'iscollection': {},
      'getcontenttype': {}
    }
  }

  /**
     * properties handler
     * @type {{DAV:: {resourcetype: resourcetype, getlastmodified: getlastmodified, creationdate: creationdate, getcontentlength: getcontentlength, getetag: getetag}, getPropValue: getPropValue, getAllPropsList: getAllPropsList, setPropValue: setPropValue, delProp: delProp}}
     */
  provider.properties = {
    'DAV:': {
      /**
       * <D:collection /> if dirrectory and null in other case
       * @param item
       * @returns {String|null}
       */
      resourcetype: function (item) {
        return !provider.record || provider.record.get('isFolder') ? '<D:collection />' : null
      },
      getlastmodified: function (item) {
        var record = provider.record
        return record && record.get('mi_modifyDate') ? (new Date(record.get('mi_modifyDate'))).toISOString() : null
      },
      creationdate: function (item) {
        var record = provider.record
        return record && record.get('mi_createDate') ? (new Date(record.get('mi_createDate'))).toISOString() : null
      },
      getcontentlength: function (item) {
        var fileData = provider.record ? provider.record.get('fileData') : null
        if (fileData) {
          fileData = JSON.parse(fileData)
        }
        return !provider.record || provider.record.get('isFolder') ? 0
          : (fileData ? fileData.size || 0 : 0)
      },
      getetag: function (item) {
        return null
      },
      supportedlock: function () {
        return !provider.record /* || !provider.canWrite */ /* || provider.record.get('isFolder') */ ? null
          : '<D:lockentry><D:lockscope><D:exclusive /></D:lockscope><D:locktype><D:write /></D:locktype></D:lockentry>'
      },
      ishidden: function () {
        return 0
      },
      iscollection: function () {
        return !provider.record || provider.record.get('isFolder') ? 1 : 0
      },
      displayname: function () {
        return provider.currentName || provider.fileName || null
      },
      getcontenttype: function () {
        return !provider.record ? null
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
    },
    getPropValue: function (item, ns, name) {
      return null
    },
    setPropValue: function (ns, name, value) {
      return null
    },
    delProp: function (ns, name) {
      return null
    }
  }

  provider.getItems = function () {
    var res = []
    // every node is empty folder
    return res
  }

  provider.doGet = function (resp) {
    var me = this, docHandler,
      docReq = new TubDocumentRequest()
    if (!Session.userID || (Session.userID < 0) || !me.canRead) {
      throw new Error('Access deny')
    }

    docReq.entity = me.entity
    docReq.attribute = me.attribute
    docReq.id = me.storedId
    docReq.isDirty = me.isTemp
    docHandler = docReq.createHandlerObject(false)
    docHandler.loadContent(TubLoadContentBody.No /* WithBody */)
    docHandler.fillResponse()
  }

  provider.getContentLength = function () {
    var me = this, docHandler,
      docReq
    if (me.entity === null || !me.storedId) {
      return 0
    }
    docReq = new TubDocumentRequest()
    docReq.entity = me.entity
    docReq.attribute = me.attribute
    docReq.id = me.storedId
    docReq.isDirty = me.isTemp
    docHandler = docReq.createHandlerObject(false)
    docHandler.loadContent(TubLoadContentBody.No /* WithBody */)
    return docHandler.content.size
  }

  provider.doPut = function (req) {
    var me = this,
      storeInfo,
      reqContent, eParams,
      docReq = new TubDocumentRequest()

    if (!Session.userID || Session.userID < 0) {
      throw new Error('Access deny')
    }

    if (!global[me.entity].hasFullAccess(me.id, 'write')) {
      throw new Error('Acess deny')
    }

    docReq.entity = me.entity
    docReq.attribute = me.attribute
    docReq.id = me.storedId
    docReq.fileName = me.fileName
    docReq.isDirty = true// me.isTemp;
    reqContent = req.read('bin')
    storeInfo = docReq.setBodyFromArrayBuffer(reqContent)
    reqContent = null

    if (me.isTemp && me.isNewTemp) {
      // add temp file
      me.store.run('insert', {
        fieldList: ['ID', 'name', 'mi_modifyDate'],
        execParams: {
          ID: me.storedId,
          name: me.fileName,
          parentID: me.id,
          isFolder: false,
          isTemporary: true
          //, lockType: 'ltTemp'
        }
      }
      )
      eParams = {
        ID: me.storedId,
        mi_modifyDate: me.store.get(2)
      }
    } else {
      me.store.run('select', {
        entity: me.entity,
        method: 'select',
        lockType: 'ltTemp',
        ID: me.storedId,
        fieldList: [me.attribute, 'mi_modifyDate']
      })

      eParams = {
        ID: me.storedId,
        mi_modifyDate: me.store.get(1)
      }
    }
    // docHandler = docReq.createHandlerObject(false);
    // docHandler.loadContentFromRequest(TubLoadContentBody.No);
    // docHandler.SaveContentToTempStore();

    eParams.fileData = storeInfo // JSON.stringify(docHandler.content)
    me.store.run('update', {
      entity: me.entity,
      fieldList: ['ID', 'name', 'mi_modifyDate'],
      execParams: eParams
    }
    )

    return me.isTemp && me.isNewTemp
  }

  provider.doMove = function (destination, overwrite) {
    // undefined - bad destanation
    // false - cannot overwrite
    // true - created
    // null - owerrided
    if (!Session.userID || Session.userID < 0) {
      throw new Error('Access deny')
    }
    if (!global[provider.entity].hasFullAccess(me.id, 'write')) {
      throw new Error('Acess deny')
    }

    var me = this,
      res = null,
      destFileName = destination[2],
      destIsTemp = destFileName !== me.currentName,
      docHandler,
      docReq, destRecord, destID, destIsNew, eParams

    // move only temp files
    if (destination.length !== 3 || destination[0] !== me.entity || destination[1] !== me.id) {
      res = undefined
      return res
      // throw new Error('invalid destination');
    }

    if (destFileName === me.fileName) { // the source equal the destination
      return false
    }

    docReq = new TubDocumentRequest()
    docReq.entity = me.entity
    docReq.attribute = me.attribute
    docReq.id = me.storedId
    docReq.isDirty = false
    docReq.fileName = me.fileName
    docHandler = docReq.createHandlerObject(false)
    docHandler.loadContent(TubLoadContentBody.Yes /* WithBody */)

    // move to temp
    if (destIsTemp) {
      destIsNew = true
      destRecord = UB.Repository(me.entity)
        .attrs(['ID', 'isTemporary', 'fileData', 'mi_modifyDate'])
        .where('[parentID]', '=', me.id)
        .where('[name]', '=', destFileName)
        .select()
    } else {
      destRecord = UB.Repository(me.entity)
        .attrs(['ID', 'isTemporary', 'fileData', 'mi_modifyDate'])
        .where('[ID]', '=', me.id)
        .select()
    }
    if (destRecord.rowCount === 0) {
      if (!destIsTemp) {
        res = undefined
        return res
        // throw new Error('Invalid destination');
      }
      res = true
      // add new record for temp file
      destID = me.store.generateID()
      me.store.run('insert', {
        fieldList: ['ID', 'name', 'mi_modifyDate'],
        execParams: {
          ID: destID,
          name: destFileName,
          parentID: me.id,
          isFolder: false,
          isTemporary: true//,
          // lockType: 'ltTemp'
        }
      }
      )
      eParams = {
        ID: destID,
        mi_modifyDate: me.store.get(2)
      }
    } else {
      destIsNew = false
      destID = destRecord.get(0)
      // JSON.parce(destRecord.get('fileData');
      // docHandler.content.revision = prevFti.revision;
      eParams = {
        ID: destID,
        mi_modifyDate: destRecord.get(3)
      }
    }

    docHandler.request.id = destID
    docHandler.content.fName = destFileName
    docHandler.content.origName = destFileName
    docHandler.saveContentToTempStore()

    eParams[me.attribute] = JSON.stringify(docHandler.content)
    me.store.run('update', {
      entity: me.entity,
      fieldList: ['ID', 'name', me.attribute, 'mi_modifyDate'],
      execParams: eParams
    }
    )
  }

  provider.getLock = function (destination) {
    var me = this, lock, lockResult, request, response
    if (me.level < 3) {
      return {}
    }

    if (!me.canWrite) {
      return {
        scope: 'exclusive',
        type: 'write',
        owner: 'superUser',
        depth: 0,
        timeout: 360, // use persist lock  -- 60
        token: me.storedId
      }
    }
    /*
        me.store.run('select', {
            entity: me.entity,
            method: 'select',
            ID: me.id,
            fieldList: ['ID']
        });
        */

    // if (me.isNewTemp){ // for new temp file
    //    return response;
    // }

    me.store.initialize([])

    // me.store.initFromJSON({"fieldCount":1,"values":["ID"],"rowCount":0});

    request = {
      entity: me.entity,
      method: 'isLocked',
      ID: me.storedId,
      fieldList: ['ID']
    }
    me.store.run('isLocked', request)
    lockResult = me.store.lockResult
    if (!lockResult) { // me.store.lockResult
      return {}
    }

    lock = JSON.parse(lockResult)
    if (lock.lockType === 'None') {
      return {}
    }
    response = {
      scope: 'exclusive',
      type: 'write',
      owner: lock.lockUser,
      depth: 0,
      timeout: 360, // use persist lock  -- 60
      token: me.storedId
    }
    return response
  }

  provider.doLock = function (lockObj) {
    var me = this, success = false, lockResult
    if (!Session.userID || Session.userID < 0) {
      throw new Error('Access deny')
    }
    if (!me.canWrite) {
      throw new Error('Access deny')
      // return {};
    }

    lockObj.depth = 0
    lockObj.timeout = 360 // use persist lock  -- 60
    lockObj.token = me.storedId
    lockObj.locktype = 'write'
    lockObj.lockscope = 'exclusive'
    lockObj.owner = Session.login || Session.userID

    me.store.run('select', {
      entity: me.entity,
      method: 'select',
      ID: me.storedId,
      lockType: 'ltPersist',
      fieldList: ['ID']
    })

    if (me.store.lockResult) {
      lockResult = JSON.parse(me.store.lockResult)
      success = lockResult.success
    }
    if (!success) {
      return {}
    }
    return lockObj
  }

  provider.doUnLock = function (token) {
    var me = this
    if (!Session.userID || Session.userID < 0) {
      throw new Error('Access deny')
    }
    if (!me.canWrite) {
      throw new Error('Access deny')
      // return {};
    }
    me.store.run('unlock', {
      entity: me.entity,
      method: 'unlock',
      ID: me.storedId
    })
    return true
  }

  provider.doDelete = function () {
    return false
    // user can not delete file using webDAV
    /*
         var me = this;
        if (!Session.userID || Session.userID < 0){
            throw new Error('Access deny');
        }
        if (!me.isTemp){
            return false;
        }
        try {
            me.store.run('delete', {
                entity: me.entity,
                ID: me.storedId
            });
        } catch (error){
            return false;
        }

        return true;
        */
  }

  provider.doCreateDir = function () {
    return false
  }

  console.log('!!UKDISk WD!!')
  require('./modules/WebDav.js').registerProvider(provider.name, provider) // {modules: {exports: provider}}
  require('./modules/WebDav.js').registerProvider('docAttr', require('models/WD/_providers/webDavDocAttrProvider.js'))
//   require('models/WD/modules/WebDav.js').registerProvider(provider.name, provider  ); //{modules: {exports: provider}}
//   require('models/WD/modules/WebDav.js').registerProvider('docAttr', require('models/WD/_providers/webDavDocAttrProvider.js'));
}())
