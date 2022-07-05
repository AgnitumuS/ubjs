const base = require('@unitybase/base')
const argv = base.argv
const execSql = require('@unitybase/ubcli/lib/execSql')

const RULE_PREFIX = 'TNTU_DENY_'
const TENANT_USER_ROLE_NAME = 'TenantUser'
const COMPARABLE_ATTRIBUTES = [
  'code',
  'description',
  'disabled',
  'entityMask',
  'methodMask',
  'ruleType',
  'ruleRole'
]

/**
 * @param {SyncConnection} conn
 */
function buildExpectedEls (conn) {
  const tenantUserRoleID = conn.Repository('uba_role')
    .attrs('ID')
    .where('name', '=', TENANT_USER_ROLE_NAME)
    .selectScalar()
  if (!tenantUserRoleID) {
    throw new Error(`There is no role "${TENANT_USER_ROLE_NAME}", cannot setup ELS`)
  }

  // Get extended domain info to reuse domain cache
  // (the "migrate" command loads extended domain info)
  const domain = conn.getDomainInfo(true)

  const expectedEls = new Map()
  for (const ei of Object.values(domain.entities)) {
    if (base.ubVersionNum < 5022010) { // starts from 5.22.10 ACL & many entities is the same as all other
      if (ei.isManyManyRef || ei.code.endsWith('_acl')) {
        // Workaround for UB issue: ACL and Many entities do not have multi-tenancy mixin yet
        continue
      }
    }
    if (ei.dsType === 'External') {
      continue
    }
    if (!ei.mixins.multitenancy || ei.mixins.multitenancy.enabled === false) {
      const ruleCode = RULE_PREFIX + ei.code.toUpperCase()
      expectedEls.set(
        ruleCode,
        {
          code: ruleCode,
          description: `Deny any updates for ${ei.code} entity`,
          disabled: 0,
          entityMask: ei.code,
          methodMask: '[^s]*',
          ruleType: 'D',
          ruleRole: tenantUserRoleID
        }
      )
    }
  }
  return expectedEls
}

/**
 * @param {SyncConnection} conn
 */
function loadElsFromDb (conn) {
  console.log('Loading ELS rules for TenantUser role...')
  const elsInDb = conn.Repository('uba_els')
    .attrs('ID', ...COMPARABLE_ATTRIBUTES)
    .where('code', 'startsWith', RULE_PREFIX)
    .selectAsObject()
  console.log('Loaded %d rules', elsInDb.length)
  return elsInDb
}

/**
 * @param {SyncConnection} conn
 * @param tenantID
 */
function mergeElsRules ({ conn, tenantID }) {
  if (tenantID !== 1) {
    // Run once, for system tenant only
    return
  }
  console.log('Start merging ELS rules for the TenantUser role')

  const expectedEls = buildExpectedEls(conn)
  const elsInDb = loadElsFromDb(conn)

  const elsInDbCodes = new Set()
  for (const elsAsIs of elsInDb) {
    elsInDbCodes.add(elsAsIs.code)
    const elsToBe = expectedEls.get(elsAsIs.code)
    if (!elsToBe) {
      console.log('Deleting rule %s', elsAsIs.code)
      conn.query({
        entity: 'uba_els',
        method: 'delete',
        execParams: {
          ID: elsAsIs.ID
        }
      })
    } else if (COMPARABLE_ATTRIBUTES.some(attr => elsToBe[attr] !== elsAsIs[attr])) {
      conn.query({
        entity: 'uba_els',
        method: 'update',
        execParams: Object.assign({ ID: elsAsIs.ID }, elsToBe),
        __skipOptimisticLock: true
      })
    }
  }

  for (const elsToBe of expectedEls.values()) {
    if (!elsInDbCodes.has(elsToBe.code)) {
      console.log('Inserting rule %s', elsToBe.code)
      conn.insert({
        entity: 'uba_els',
        execParams: elsToBe
      })
    }
  }

  console.log('Finished merging ELS rules for the TenantUser role')
}

function fixTenantIdForUbaSubject () {
  console.log('Set mi_tenantID=0 for uba_subject for roles')
  execSql({ sql: 'update uba_subject set mi_tenantID=0 where mi_tenantID<>0 and sType=\'R\'' })
}

/**
 * @param params
 */
function finalizeUbaForTenants (params) {
  mergeElsRules(params)
  fixTenantIdForUbaSubject(params)
}

const serverConfig = argv.getServerConfiguration()
const multitenancyConfig = serverConfig.security.multitenancy
const multitenancyEnabled = multitenancyConfig && multitenancyConfig.enabled

module.exports = {
  /**
   * @param {SyncConnection} conn
   * @param dbConnections
   */
  finalize: multitenancyEnabled ? finalizeUbaForTenants : undefined
}
