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
   * @param {string} ubql.method Method to use (usually === select)
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
   * @param {object} ctx
   * @param {string} ctx.entity Entity code
   * @param {string} ctx.method Should be === 'insert'
   * @param {object} ctx.execParams Pairs of attributeName: attributeValue to be inserted
   * @param {array<string>} [ctx.fieldList] Optional names of attributes to be returned in result.
   *   Additional DB query is required to return values, so if caller do not need it better to not pass a fieldList to insert
   */
  insert: function (ctx) {},
  /**
   * Update existed record
   * @published
   * @param {object} ctx
   * @param {string} ctx.entity Entity code
   * @param {string} ctx.method Should be === 'update'
   * @param {Object<string, *>} ctx.execParams Pairs of attributeName: attributeValue to be updated
   * @param {number} ctx.execParams.ID ID of instance we update
   * @param {array<string>} [ctx.fieldList] Optional names of attributes to be returned in result.
   *   Additional DB query is required to return values, so if caller do not need it better to not pass a fieldList to update
   */
  update: function (ctx) {},
  /**
   * Delete record by ID
   * @published
   * @param {object} ctx
   * @param {string} ctx.entity Entity code
   * @param {string} ctx.method Should be === 'delete'
   * @param {number} ctx.ID Instance ID to be deleted
   */
  delete: function (ctx) {},
  /**
   * Create record with filled default values and return it to caller.
   * Newly created record is not inserted to database. For inserting record to the database `insert` method should be called
   * @published
   * @param {object} ctx
   * @param {string} ctx.entity Entity code
   * @param {string} ctx.method Should be === 'lock'
   * @param {object} [ctx.execParams] Optional values for attributes of new record
   * @param {array<string>} ctx.fieldList Names of attributes to be returned in result.
   */
  addnew: function (ctx) {}
}

/**
 * Mixin. Pessimistic Lock implementation
 * @mixin
 */
const softLock_api = {
  /**
   * Lock record. If record is not locked then `update` & `delete` operation are not permitted
   * @published
   * @param {object} ctx
   * @param {string} ctx.entity Entity code
   * @param {string} ctx.method Should be === 'lock'
   * @param {number} ctx.ID Record ID to lock
   * @param {string} ctx.lockType Either 'Temp' or 'Persist'
   */
  lock: function (ctx) {},
  /**
   * Unlock record
   * @published
   * @param {object} ctx
   * @param {string} ctx.entity Entity code
   * @param {string} ctx.method Should be === 'unlock'
   * @param {number} ctx.lockID ID of lock to remove
   */
  unlock: function (ctx) {},
  /**
   * Renew existed lock
   * @published
   * @param {object} ctx
   * @param {string} ctx.entity Entity code
   * @param {string} ctx.method Should be === 'renewLock'
   * @param {number} ctx.lockID ID of lock to remove
   */
  renewLock: function (ctx) {},
  /**
   * Check record is locked
   * @published
   * @param {object} ctx
   * @param {string} ctx.entity Entity code
   * @param {string} ctx.method Should be === 'isLocked'
   * @param {number} ctx.ID Record ID
   */
  isLocked: function (ctx) {}
}

/**
 * Mixin. Provide Attribute Level Security
 * @mixin
 */
const als_api = {
  /**
   * Return all possible roles what is a subject of attribute level security
   * @param {object} ctx
   * @param {string} ctx.entity Entity code
   * @param {string} ctx.method Should be === 'getallroles'
   */
  getallroles: function (ctx) {},
  /**
   * Return all possible states what is a subject of attribute level security
   * @param {object} ctx
   * @param {string} ctx.entity Entity code
   * @param {string} ctx.method Should be === 'getallstates'
   */
  getallstates: function (ctx) {},
  /**
   * Test Attribute Level Security configuration. For dev mode only
   * @param {object} ctx
   * @param {string} ctx.entity Entity code
   * @param {string} ctx.method Should be === 'testAls'
   */
  testAls: function(ctx) {}
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
   * @param {object} ctx
   * @param {string} ctx.entity Entity code
   * @param {string} ctx.method Should be === 'newversion'
   * @param {object} [ctx.execParams] Optional values for attributes of new record
   * @param {array<string>} ctx.fieldList Names of attributes to be returned in result
   */
  newversion: function (ctx) {}
}

/**
 * Mixin. Full Text Search. See {@tutorial mixins_fts} for details
 *
 * @mixin
 */
const fts_api = {
  /**
   * Full text search query
   * @param {object} ctx
   */
  fts: function (ctx) {},
  /**
   * Re-create entity FTS index
   * @param {ubMethodParams} ctx
   */
  ftsreindex: function (ctx) {}
}
