const UB = require('@unitybase/ub')
const _ = require('lodash')
const App = UB.App

const processTerminationRequested = typeof process.terminationRequested === 'function'
  ? process.terminationRequested
  : function () { return false } // UB < 5.20.10 compatibility

/**
 * Used by scheduler to build a full text search index.
 * Read queue with code **ASYNCFTS** (by portion of 1000 queue rows at once) and rebuild FTS indexes.
 *
 * Expect msgCmd value in form: {"entity":"tst_document","ID":3000000005908,"operation":"DELETE"}
 * Possible operation is 'INSERT' 'UPDATE' 'DELETE'
 *
 * @module ubqFTSJob
 * @memberOf module:@unitybase/ubq
 */
module.exports = function () {
  console.log('Call JS scheduler method: UB.UBQ.FTSReindexFromQueue')

  const commandsAsArr = UB.Repository('ubq_messages')
    .attrs(['ID', 'msgCmd'])
    .where('[queueCode]', '=', 'ASYNCFTS')
    .where('[completeDate]', 'isNull')
    .limit(1000)
    .selectAsArray()

  const cmdArray = []
  const handledMessageIDs = []
  let operationCount = 0
  commandsAsArr.resultData.data.forEach(r => {
    const cmd = JSON.parse(r[1]) // msgCmd
    cmd.msgID = r[0] // ubq_messages.ID
    cmdArray.push(cmd)
  })
  // prevent multiple index update on the same instanceID
  // in case delete operation exists - we must delete from index, in case not - update index
  // group by entity {tst_document: [], other_entity: [], ...}
  const groupedByEntity = _.groupBy(cmdArray, 'entity')
  _.forEach(groupedByEntity, function (commandsForEntity, entityName) {
    if (processTerminationRequested()) return false // _.forEach: exit iteration early by explicitly returning false
    if (!App.domainInfo.has(entityName)) {
      console.warn(`Entity "${entityName}" scheduled in FTS operation is not in domain. Skips`)
      commandsForEntity.forEach(c => { handledMessageIDs.push(c.msgID) }) // mark all messages for unavailable entity as handled
      return
    }
    const byID = _.groupBy(commandsForEntity, 'ID')
    _.forEach(byID, function (commandsForID, instanceIDStr) {
      if (processTerminationRequested()) return false // _.forEach: exit iteration early by explicitly returning false
      const instanceID = parseInt(instanceIDStr) // convert from string
      if (_.find(commandsForID, { operation: 'DELETE' })) {
        if (!_.find(commandsForID, { operation: 'INSERT' })) { // if insert exists delete is not necessary (no data in index yet)
          console.debug('AYNC_FTS: delete', entityName, instanceID)
          App.deleteFromFTSIndex(entityName, instanceID)
          operationCount++
        } else {
          console.debug('AYNC_FTS: delete+insert - skip', entityName, instanceID)
        }
      } else {
        console.debug('AYNC_FTS: update', entityName, instanceID)
        App.updateFTSIndex(entityName, instanceID)
        operationCount++
      }
      commandsForID.forEach(c => { handledMessageIDs.push(c.msgID) }) // mark all messages for instanceID as handled
    })
  })
  // mark all handledMessageIDs as complete = MUST be done even if process.terminationRequested()
  const ubqMessages = UB.DataStore('ubq_messages')
  handledMessageIDs.forEach(function (msgID) {
    ubqMessages.run('success', {
      ID: msgID
    })
  })

  // cmdStore.entity.connection.commit();
  return `Made ${operationCount} FTS modifications`
}
