const UB = require('@unitybase/ub')

/**
 * Truncate ubq_messages table if there are no non-pending tasks.
 * This job is scheduled at ~5AM, consider on this time all pending jobs are already processed
 *
 * @module ubqCleanupJob
 * @memberOf module:@unitybase/ubq
 */
module.exports = function () {
  let pendingCnt = UB.Repository('ubq_messages')
    .attrs('COUNT([ID])')
    .where('completeDate', 'isNull')
    .selectScalar()

  if (pendingCnt) {
    throw new Error(`There is ${pendingCnt} pending tasks in ubq_messages. Truncate aborted`)
  }

  let msgStore = UB.DataStore('ubq_messages')
  let queryText = (msgStore.entity.connectionConfig.dialect === 'SQLite3')
    ? 'delete from ubq_messages'
    : 'TRUNCATE TABLE ubq_messages'

  msgStore.execSQL(queryText, {})
  return `ubq_messages is truncated`
}
