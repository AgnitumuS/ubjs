const { argv } = require('@unitybase/base')

const { connection } = argv.establishConnectionFromCmdLineAttributes()

copyFromAdmToAclTable('ubm_desktop')
copyFromAdmToAclTable('ubm_navshortcut')

function copyFromAdmToAclTable (entityName) {
  const admEntityName = `${entityName}_adm`
  const aclEntityName = `${entityName}_acl`

  console.info(`\tStart moving access info for '${entityName}' from '${admEntityName}' to '${aclEntityNAme}' `)

  connection.Repository(admEntityName)
    .attrs('ID', 'instanceID', 'admSubjID')
    .selectAsObject()
    .forEach(({ instanceID, admSubjID }) => {
      connection.insert({
        entity: aclEntityName,
        execParams: {
          instanceID,
          valueID: admSubjID,
          subjID: admSubjID
        }
      })
    })

  console.info(`\tEnd moving access info for '${entityName}' from '${admEntityName}' to '${aclEntityNAme}' `)
}
