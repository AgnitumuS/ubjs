const { argv } = require('@unitybase/base')

const { connection } = argv.establishConnectionFromCmdLineAttributes()

copyFromAdmToAclTable('ubm_desktop')
copyFromAdmToAclTable('ubm_navshortcut')

function copyFromAdmToAclTable (entityName) {
  const admEntityName = `${entityName}_adm`
  const aclEntityNAme = `${entityName}_acl`

  console.info(`\tStart moving access info for '${entityName}' from '${admEntityName}' to '${aclEntityNAme}' `)

  const admEntries = connection.Repository(admEntityName)
    .attrs('ID', 'instanceID', 'admSubjID')
    .selectAsObject()

  const requests = admEntries.reduce((requests, { instanceID, admSubjID }) => {
    return requests.concat({
      entity: aclEntityNAme,
      method: 'insert',
      execParams: {
        instanceID,
        valueID: admSubjID,
        subjID: admSubjID
      }
    })
  }, [])

  connection.runTans(requests)

  console.info(`\tEnd moving access info for '${entityName}' from '${admEntityName}' to '${aclEntityNAme}' `)
}
