/* eslint-disable no-unused-vars */
// Stubs for client API documentation generation. Describes build-in mixins API

/**
 * Mixin. Provide CRUID operations for entity database persistent (ORM) using `ubql` query syntax
 * @mixin
 */
const mStorage_api = {
  /**
   * ORM query for read records
   * @param {object} ubql ORM query in UBQL format
   * @param {string} ubql.entity Entity name
   * @param {string} ubql.method Method to use (usually `select`)
   * @param {array<string>} ubql.fieldList Attributes expressions
   * @param {object<string, {expression: string, condition: string, value: *}>} [ubql.whereList] Where conditions
   * @param {array<string>} [ubql.groupBy] Group by attributes expressions
   * @param {array<string>} [ubql.orderBy] Order by attributes expressions
   * @param {array<string>} [ubql.joinAs] Array of condition names to use in join clause instead of where clause of result SQL
   * @param {string} [ubql.logicalPredicates] Optional logical concatenation of WHERE conditions
   * @param {object} [ubql.options] Options for ORM query builder. See {@link CustomRepository#misc CustomRepository.misc} documentation for possible values
   */
  select: function (ubql) {},
  /**
   * New record insertion
   * @param {object} cmd
   * @param {string} cmd.entity Entity code
   * @param {string} cmd.method Should be === 'insert'
   * @param {object} cmd.execParams Pairs of attributeName: attributeValue to be inserted
   * @param {array<string>} [cmd.fieldList] Optional names of attributes to be returned in result.
   *   Additional DB query is required to return values, so if caller do not need it better to not pass a fieldList to insert
   */
  insert: function (cmd) {},
  /**
   * Update existed record
   * @published
   * @param {object} cmd
   * @param {string} cmd.entity Entity code
   * @param {string} cmd.method Should be === 'update'
   * @param {Object<string, *>} cmd.execParams Pairs of attributeName: attributeValue to be updated
   * @param {number} cmd.execParams.ID ID of instance we update
   * @param {array<string>} [cmd.fieldList] Optional names of attributes to be returned in result.
   *   Additional DB query is required to return values, so if caller do not need it better to not pass a fieldList to update
   */
  update: function (cmd) {},
  /**
   * Delete record by ID
   * @published
   * @param {object} cmd
   * @param {string} cmd.entity Entity code
   * @param {string} cmd.method Should be === 'delete'
   * @param {number} cmd.ID Instance ID to be deleted
   */
  delete: function (cmd) {},
  /**
   * Create record with filled default values and return it to caller.
   * Newly created record is not inserted to database. For inserting record to the database `insert` method should be called
   * @published
   * @param {object} cmd
   * @param {object} [cmd.execParams] Optional values for attributes of new record
   * @param {array<string>} cmd.fieldList Names of attributes to be returned in result.
   */
  addnew: function (cmd) {}
}

/**
 * Mixin. Pessimistic Lock implementation
 * @mixin
 */
const softLock_api = {
  /**
   * Lock record. If record is not locked then `update` & `delete` operation are not permitted
   * @published
   * @param {object} cmd
   * @param {string} cmd.entity Entity code
   * @param {string} cmd.method Should be === 'lock'
   * @param {number} cmd.ID Record ID to lock
   * @param {string} cmd.lockType Either 'Temp' or 'Persist'
   */
  lock: function (cmd) {},
  /**
   * Unlock record
   * @published
   * @param {object} cmd
   * @param {string} cmd.entity Entity code
   * @param {string} cmd.method Should be === 'unlock'
   * @param {number} cmd.lockID ID of lock to remove
   */
  unlock: function (cmd) {},
  /**
   * Renew existed lock
   * @published
   * @param {object} cmd
   * @param {string} cmd.entity Entity code
   * @param {string} cmd.method Should be === 'renewLock'
   * @param {number} cmd.lockID ID of lock to remove
   */
  renewLock: function (cmd) {},
  /**
   * Check record is locked
   * @published
   * @param {object} cmd
   * @param {string} cmd.entity Entity code
   * @param {string} cmd.method Should be === 'isLocked'
   * @param {number} cmd.ID Record ID
   */
  isLocked: function (cmd) {}
}

/**
 * Mixin. Provide Attribute Level Security
 * @mixin
 */
const als_api = {
  /**
   * Return all possible roles what is a subject of attribute level security
   * @param {object} cmd
   * @param {string} cmd.entity Entity code
   * @param {string} cmd.method Should be === 'getallroles'
   */
  getallroles: function (cmd) {},
  /**
   * Return all possible states what is a subject of attribute level security
   * @param {object} cmd
   * @param {string} cmd.entity Entity code
   * @param {string} cmd.method Should be === 'getallstates'
   */
  getallstates: function (cmd) {}
}

/**
 * Mixin. Provide historical data storage
 * @mixin
 */
const dataHistory_api = {
  /**
   * Create new version of specified record
   * @param {object} ctx
   */
  /**
   * Create new version of specified record.
   * Newly created record is not inserted to database. For inserting record to the database `insert` method should be called
   * @param {object} cmd
   * @param {string} cmd.entity Entity code
   * @param {string} cmd.method Should be === 'newversion'
   * @param {object} [cmd.execParams] Optional values for attributes of new record
   * @param {array<string>} cmd.fieldList Names of attributes to be returned in result
   */
  newversion: function (cmd) {}
}

/**
 * Mixin. Full Text Search. See {@tutorial mixins_fts} for details
 *
 * @mixin
 */
const fts_api = {
  /**
   * Full text search query
   * @param {object} cmd
   */
  fts: function (cmd) {},
  /**
   * Re-create entity FTS index
   * @param {ubMethodParams} cmd
   */
  ftsreindex: function (cmd) {}
}
