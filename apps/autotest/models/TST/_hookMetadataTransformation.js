/**
 * This hook is called by server in the single thread initialization mode. In this stage
 *  - native Domain is not created yet
 *  - js files form models is not evaluated
 * Hook can mutate a Domain JSON, for example - adds additional attributes to the entities and lang files, etc
 *
 * Example below adds two additional attribute "department" and "organization" both point into the same database field "tst_maindata.staffUnit"
 *
 * @param {object<string, {modelName: string, meta: object, lang: object<string, object>}>} domainJson
 * @param {object} serverConfig
 */
function metadataTransformationTst (domainJson, serverConfig) {
  const dict = domainJson.tst_maindata
  dict.meta.attributes.push({
    name: 'department',
    caption: 'org_department', // on UI will be localized to org_department.caption by i18n
    dataType: 'Entity',
    associatedEntity: 'org_department',
    readOnly: true,
    // defaultView: false,
    mapping: [{
      name: 'AnsiSQL',
      expressionType: 'Field',
      expression: 'staffUnit'
    }]
  })
  dict.meta.attributes.push({
    name: 'organization',
    caption: 'organization',
    dataType: 'Entity',
    associatedEntity: 'org_organization',
    readOnly: true,
    // defaultView: false,
    mapping: [{
      name: 'AnsiSQL',
      expressionType: 'Field',
      expression: 'staffUnit'
    }]
  })
}
module.exports = metadataTransformationTst
