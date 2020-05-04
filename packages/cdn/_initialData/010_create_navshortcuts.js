﻿/**
 * @author pavel.mash
 * Fill navigation shortcuts for CDN model
 */

const UBA_COMMON = require('@unitybase/uba/modules/uba_common')
/**
 * Initial script for create UnityBase Common Dictionaries desktop navigation short-cuts (CDN model)
 * Used by ubcli initialize command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let desktopID
  let usersRoleID
  let folderID
  let lastID
  let conn = session.connection

  desktopID = conn.lookup('ubm_desktop', 'ID', { expression: 'code', condition: 'equal', values: { code: 'cdn_desktop' } })
  usersRoleID = UBA_COMMON.ROLES.USER.ID
  console.info('\tFill `Common dictionary` desktop')
  if (!desktopID) {
    console.info('\t\tcreate new `Common dictionaries` desktop')
    desktopID = conn.insert({
      entity: 'ubm_desktop',
      fieldList: ['ID'],
      execParams: {
        code: 'cdn_desktop',
        caption: 'Common dictionaries',
        iconCls: 'u-icon-desktop-dictionaries',
        description: 'Directories of subjects, addresses, other classifiers'
      }
    })
    console.info('\t\tprovide rights for `Common dictionaries` to users role')
    conn.insert({
      entity: 'ubm_desktop_adm',
      execParams: {
        instanceID: desktopID,
        admSubjID: usersRoleID
      }
    })
  } else {
    console.info('\t\tuse existed desktop with code `cdn_desktop`', desktopID)
  }

  console.log('\t\tcreate `Territorial` folder')
  folderID = conn.insert({
    entity: 'ubm_navshortcut',
    fieldList: ['ID'],
    execParams: {
      desktopID: desktopID,
      code: 'cdn_folder_territorial',
      caption: 'Territorial',
      isFolder: true,
      isCollapsed: false,
      iconCls: 'fa fa-globe',
      displayOrder: 10
    }
  })
  console.info('\t\tprovide rights for `Territorial` folder to users role')
  conn.insert({
    entity: 'ubm_navshortcut_adm',
    execParams: {
      instanceID: folderID,
      admSubjID: usersRoleID
    }
  })

  console.log('\t\t\tcreate `Regions` shortcut')
  lastID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'cdn_region',
      caption: 'Regions',
      iconCls: 'fa fa-cloud',
      displayOrder: 10,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'cdn_region'
        }
      }, null, '\t')
    }
  })
  console.info('\t\tprovide rights for `Regions` shortcut to users role')
  conn.insert({ entity: 'ubm_navshortcut_adm', execParams: { instanceID: lastID, admSubjID: usersRoleID } })

  console.log('\t\t\tcreate `City` shortcut')
  lastID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'cdn_city',
      caption: 'Cities',
      iconCls: 'fa fa-group', // 'fa fa-institution' - where is this icon??
      displayOrder: 20,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'cdn_city'
        }
      }, null, '\t')
    }
  })
  console.info('\t\tprovide rights for `City` shortcut to users role')
  conn.insert({ entity: 'ubm_navshortcut_adm', execParams: { instanceID: lastID, admSubjID: usersRoleID } })

  console.log('\t\t\tcreate `Country` shortcut')
  lastID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'cdn_country',
      caption: 'Countries',
      iconCls: 'fa fa-flag-o',
      displayOrder: 30,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'cdn_country'
        }
      }, null, '\t')
    }
  })
  console.info('\t\tprovide rights for `Country` shortcut to users role')
  conn.insert({ entity: 'ubm_navshortcut_adm', execParams: { instanceID: lastID, admSubjID: usersRoleID } })

  console.log('\t\t\tcreate `Admin units` shortcut')
  lastID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'cdn_adminunit',
      caption: 'Admin units',
      iconCls: 'fa fa-object-ungroup',
      displayOrder: 40,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'cdn_adminunit'
        }
      }, null, '\t')
    }
  })
  console.info('\t\tprovide rights for `Admin units` shortcut to users role')
  conn.insert({ entity: 'ubm_navshortcut_adm', execParams: { instanceID: lastID, admSubjID: usersRoleID } })

  console.log('\t\t\tcreate `Streets` shortcut')
  lastID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'cdn_street',
      caption: 'Streets',
      iconCls: 'fas fa-map-signs',
      displayOrder: 50,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'cdn_street'
        }
      }, null, '\t')
    }
  })
  console.info('\t\tprovide rights for `Streets` shortcut to users role')
  conn.insert({ entity: 'ubm_navshortcut_adm', execParams: { instanceID: lastID, admSubjID: usersRoleID } })

  console.log('\t\t\tcreate `Region types` shortcut')
  lastID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'cdn_regiontype',
      caption: 'Region types',
      displayOrder: 100,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'cdn_regiontype'
        }
      }, null, '\t')
    }
  })
  console.info('\t\tprovide rights for `Region types` shortcut to users role')
  conn.insert({ entity: 'ubm_navshortcut_adm', execParams: { instanceID: lastID, admSubjID: usersRoleID } })

  console.log('\t\t\tcreate `City types` shortcut')
  lastID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'cdn_citytype',
      caption: 'City types',
      displayOrder: 110,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'cdn_citytype'
        }
      }, null, '\t')
    }
  })
  console.info('\t\tprovide rights for `City types` shortcut to users role')
  conn.insert({ entity: 'ubm_navshortcut_adm', execParams: { instanceID: lastID, admSubjID: usersRoleID } })

  // Subjects
  console.log('\t\tcreate `Subjects` folder')
  folderID = conn.insert({
    entity: 'ubm_navshortcut',
    fieldList: ['ID'],
    execParams: {
      desktopID: desktopID,
      code: 'cdn_folder_subjects',
      caption: 'Subjects',
      isFolder: true,
      isCollapsed: false,
      iconCls: 'fa fa-user-circle-o',
      displayOrder: 10
    }
  })
  console.info('\t\tprovide rights for `City types` shortcut to users role')
  conn.insert({ entity: 'ubm_navshortcut_adm', execParams: { instanceID: folderID, admSubjID: usersRoleID } })

  console.log('\t\t\tcreate `Organizations` shortcut')
  lastID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'cdn_organization',
      caption: 'Organizations',
      iconCls: 'fa fa-university',
      displayOrder: 10,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'cdn_organization',
          columns: ['OKPOCode', 'name', 'fullName', 'description', 'orgBusinessTypeID.name', 'orgOwnershipTypeID.name']
        }
      }, null, '\t')
    }
  })
  console.info('\t\tprovide rights for `Organizations` shortcut to users role')
  conn.insert({ entity: 'ubm_navshortcut_adm', execParams: { instanceID: lastID, admSubjID: usersRoleID } })

  console.log('\t\t\tcreate `Employee` shortcut')
  lastID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'cdn_employee',
      caption: 'Employee',
      iconCls: 'fa fa-briefcase',
      displayOrder: 20,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'cdn_employee',
          columns: ['ID', 'lastName', 'firstName', 'middleName', 'sexType', 'uniqNum', 'organizationID.name', 'departmentID.name']
        }
      }, null, '\t')
    }
  })
  console.info('\t\tprovide rights for `Employee` shortcut to users role')
  conn.insert({ entity: 'ubm_navshortcut_adm', execParams: { instanceID: lastID, admSubjID: usersRoleID } })

  console.log('\t\t\tcreate `Departments` shortcut')
  lastID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'cdn_department',
      caption: 'Departments',
      iconCls: 'fa fa-cubes',
      displayOrder: 30,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'cdn_department',
          columns: ['ID', 'code', 'name', 'fullName', 'depTypeID', 'organizationID.name']
        }
      }, null, '\t')
    }
  })
  console.info('\t\tprovide rights for `Departments` shortcut to users role')
  conn.insert({ entity: 'ubm_navshortcut_adm', execParams: { instanceID: lastID, admSubjID: usersRoleID } })

  console.log('\t\t\tcreate `Persons` shortcut')
  lastID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'cdn_person',
      caption: 'Persons',
      iconCls: 'fa fa-male',
      displayOrder: 40,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'cdn_person',
          columns: ['lastName', 'firstName', 'middleName', 'birthDate', 'description']
        }
      }, null, '\t')
    }
  })
  console.info('\t\tprovide rights for `Persons` shortcut to users role')
  conn.insert({ entity: 'ubm_navshortcut_adm', execParams: { instanceID: lastID, admSubjID: usersRoleID } })

  console.log('\t\t\tcreate `Banks` shortcut')
  lastID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'cdn_bank',
      caption: 'Banks',
      iconCls: 'fas fa-hand-holding-usd',
      displayOrder: 40,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'cdn_bank'
        }
      }, null, '\t')
    }
  })
  console.info('\t\tprovide rights for `Banks` shortcut to users role')
  conn.insert({ entity: 'ubm_navshortcut_adm', execParams: { instanceID: lastID, admSubjID: usersRoleID } })

  console.log('\t\tcreate `Miscellaneous` folder')
  folderID = conn.lookup('ubm_navshortcut', 'ID', { expression: 'code', condition: 'equal', values: { code: 'cdn_folder_misc' } })
  if (!folderID) {
    folderID = conn.insert({
      entity: 'ubm_navshortcut',
      fieldList: ['ID'],
      execParams: {
        desktopID: desktopID,
        code: 'cdn_folder_misc',
        caption: 'Miscellaneous',
        isFolder: true,
        isCollapsed: true,
        iconCls: 'fa fa-cogs',
        displayOrder: 40
      }
    })
  }
  console.info('\t\tprovide rights for Miscellaneous` folder to users role')
  conn.insert({ entity: 'ubm_navshortcut_adm', execParams: { instanceID: folderID, admSubjID: usersRoleID } })

  console.log('\t\t\tcreate `Currency` shortcut')
  lastID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'cdn_currency',
      caption: 'Currency',
      iconCls: 'fa fa-usd',
      displayOrder: 10,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'cdn_currency',
          columns: [
            { id: 'intCode', maxWidth: '60' },
            { id: 'code3', maxWidth: '70' },
            'name', 'description'
          ]
        }
      }, null, '\t')
    }
  })
  console.info('\t\tprovide rights for `Currency` shortcut to users role')
  conn.insert({ entity: 'ubm_navshortcut_adm', execParams: { instanceID: lastID, admSubjID: usersRoleID } })

  console.log('\t\t\tcreate `Languages` shortcut')
  lastID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'cdn_language',
      caption: 'Languages',
      iconCls: 'fa fa-language',
      displayOrder: 20,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'cdn_language'
        }
      }, null, '\t')
    }
  })
  console.info('\t\tprovide rights for `Languages` shortcut to users role')
  conn.insert({ entity: 'ubm_navshortcut_adm', execParams: { instanceID: lastID, admSubjID: usersRoleID } })

  console.log('\t\t\tcreate `Classifiers` shortcut')
  lastID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'cdn_classifier',
      caption: 'Classifiers',
      iconCls: 'fa fa-tags',
      displayOrder: 30,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'cdn_classifier'
        }
      }, null, '\t')
    }
  })
  console.info('\t\tprovide rights for `Classifiers` shortcut to users role')
  conn.insert({ entity: 'ubm_navshortcut_adm', execParams: { instanceID: lastID, admSubjID: usersRoleID } })
}
