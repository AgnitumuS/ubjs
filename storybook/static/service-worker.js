self.addEventListener('fetch', event => {
  if (event.request.url.includes('getAppInfo')) {
    event.respondWith(new Response(JSON.stringify({
      'appVersion': '5.0.81',
      'serverVersion': 'v5.7.4',
      'defaultLang': 'en',
      'trafficEncryption': false,
      'serverCertificate': '',
      'encryptionKeyLifetime': 0,
      'authMethods': ['UB'],
      'supportedLanguages': ['en', 'uk', 'kz'],
      'supportedWSProtocols': [],
      'uiSettings': {
        'adminUI': {
          'applicationName': {
            'en': 'Autotest UB SQLITE',
            'uk': 'Автотест UB SQLITE'
          },
          'applicationTitle': 'AdminUI',
          'defaultPasswordForDebugOnly': 'admin',
          'themeName': 'UBGrayTheme',
          'loginWindowTopLogoURL': '/models/ub-pub/img/ub-login-logo.png',
          'endpoint': 'ubadminui',
          'loginURL': '/models/adminui-vue/views/ub-auth.html',
          'customSidebar': false,
          'customNavbar': false,
          'vueAutoForms': true,
          'messenger': {
            'enabled': true,
            'checkInterval': 30
          },
          'linter': {
            'asi': true,
            'sub': true
          },
          'onlyOffice': {
            'serverIP': '10.8.17.6:32771'
          }
        },
        'portalUI': {
          'applicationName': 'UBCore usage'
        }
      }
    }), {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'ETag': '"C54D74C8"',
        'Server': 'UnityBase Microsoft-HTTPAPI/2.0'
      }
    }))
  }
  if (event.request.url.includes('setDocument')) {
    event.respondWith(event.request.blob().then(function (data) {
      let result = {
        result: {
          'store': 'simple',
          'fName': 'doc.txt',
          'origName': 'doc.txt',
          'ct': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'size': 119137,
          'md5': '',
          'isDirty': true
        }
      }
      return new Response(JSON.stringify(result), {
        status: 200,
        statusText: 'OK',
        headers: {
          'Access-Control-Allow-Methods': 'POST, PUT, GET, DELETE, LOCK, OPTIONS',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Max-Age': 1728000,
          'Content-Type': 'application/json; charset=UTF-8'
        }
      })
    }))
  }
  if (event.request.url.includes('getDocument')) {
    event.respondWith(event.request.text().then(function (data) {
      let result = new Blob(['test'], {
        type: 'text/plain;charset=utf-8'
      })
      return new Response(result, {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Server': 'UnityBase'
        }
      })
    }))
  }
  if (event.request.url.includes('getDomainInfo')) {
    event.respondWith(new Response(JSON.stringify({
      'domain': {
        'ubm_form': {
          'modelName': 'UBM',
          'caption': 'Form',
          'description': 'Definition of interface forms',
          'connectionName': 'main',
          'cacheType': 'SessionEntity',
          'sqlAlias': 'form',
          'descriptionAttribute': 'code',
          'attributes': {
            'ID': { 'dataType': 'ID', 'caption': 'ID', 'allowNull': false, 'isUnique': true, 'name': 'ID' },
            'code': {
              'dataType': 'String',
              'size': 64,
              'caption': 'Form code',
              'allowNull': false,
              'isUnique': true,
              'name': 'code'
            },
            'description': { 'dataType': 'String', 'size': 255, 'caption': 'Description', 'name': 'description' },
            'caption': {
              'dataType': 'String',
              'size': 128,
              'caption': 'Form caption',
              'description': 'Keep it empty to use entity name as form caption',
              'name': 'caption'
            },
            'formType': {
              'dataType': 'Enum',
              'caption': 'Form type',
              'allowNull': false,
              'defaultValue': 'auto',
              'enumGroup': 'FORM_TYPE',
              'name': 'formType'
            },
            'formDef': {
              'dataType': 'Document',
              'caption': 'Form definition',
              'description': 'Form interface definition',
              'allowSort': false,
              'storeName': 'mdb',
              'name': 'formDef'
            },
            'formCode': {
              'dataType': 'Document',
              'caption': 'Form script',
              'description': 'JS form client logic',
              'allowSort': false,
              'storeName': 'mdb',
              'name': 'formCode'
            },
            'model': {
              'dataType': 'String',
              'size': 32,
              'caption': 'Model',
              'description': 'Model where form is stored',
              'documentation': 'Model where form is stored. If empty - entity model is used. The purpose of this attribute is to develop a form for entities form other models',
              'name': 'model'
            },
            'entity': {
              'dataType': 'String',
              'size': 32,
              'caption': 'Entity',
              'description': 'Entity code',
              'documentation': 'This value is used for fount default entity form',
              'name': 'entity'
            },
            'isDefault': {
              'dataType': 'Boolean',
              'caption': 'Is default',
              'description': 'Is this is default entity form',
              'allowNull': false,
              'defaultValue': '0',
              'documentation': 'On AdminUI execution of `doCommand.showForm` without passing a form code as a parameter client seek for form for entity, and if exist > 1 form - form with isDefault=true is selected',
              'name': 'isDefault'
            },
            'mi_modifyDate': {
              'dataType': 'DateTime',
              'caption': 'Modification date',
              'documentation': 'Emulate a mStorage.mi_modifyDate for cache version calculation',
              'name': 'mi_modifyDate'
            }
          },
          'mixins': {},
          'isFTSDataTable': false,
          'name': 'ubm_form',
          'entityMethods': { 'select': 1, 'update': 1, 'insert': 1, 'addnew': 1 },
          'i18n': {
            'caption': 'Form',
            'description': 'Definition of interface forms',
            'attributes': {
              'code': {
                'caption': 'Form code'
              },
              'description': {
                'caption': 'Description'
              },
              'caption': {
                'caption': 'Form title'
              },
              'formType': {
                'caption': 'Form type',
                'description': 'Form definition type (auto or custom)'
              },
              'formDef': {
                'caption': 'Form definition',
                'description': 'Form interface definition'
              },
              'formCode': {
                'caption': 'Form script',
                'description': 'JS worm client logic'
              },
              'model': {
                'caption': 'Model'
              },
              'entity': {
                'caption': 'Entity',
                'description': 'Entity code'
              },
              'isDefault': {
                'caption': 'By default',
                'description': 'Default entity form'
              }
            }
          }
        },
        'ubm_enum': {
          'modelName': 'UBM',
          'caption': 'Enumerated values',
          'description': 'Enumerated values',
          'documentation': 'On the UI used as a lookup for attributes with dataType `Enum`',
          'connectionName': 'main',
          'cacheType': 'SessionEntity',
          'sqlAlias': 'enu',
          'descriptionAttribute': 'name',
          'attributes': {
            'ID': { 'dataType': 'ID', 'allowNull': false, 'defaultView': false, 'name': 'ID' },
            'eGroup': {
              'dataType': 'String',
              'size': 32,
              'caption': 'Group',
              'description': 'Group of enumeration',
              'allowNull': false,
              'name': 'eGroup'
            },
            'code': {
              'dataType': 'String',
              'size': 32,
              'caption': 'Code',
              'description': 'Value code',
              'allowNull': false,
              'name': 'code'
            },
            'shortName': {
              'dataType': 'String',
              'size': 128,
              'caption': 'Short name',
              'isMultiLang': true,
              'name': 'shortName'
            },
            'name': {
              'dataType': 'String',
              'size': 255,
              'caption': 'Value name',
              'allowNull': false,
              'isMultiLang': true,
              'name': 'name'
            },
            'sortOrder': {
              'dataType': 'Int',
              'caption': 'Order #',
              'allowNull': false,
              'defaultValue': '100',
              'documentation': 'This attribute is used for ordering enum on UI select. Default = 100 for easy change order to be more or less',
              'name': 'sortOrder'
            },
            'mi_owner': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'Row owner',
              'allowNull': false,
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_owner'
            },
            'mi_createDate': {
              'dataType': 'DateTime',
              'description': 'Creation date',
              'allowNull': false,
              'defaultValue': 'currentDate',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_createDate'
            },
            'mi_createUser': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'User who create row',
              'allowNull': false,
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_createUser'
            },
            'mi_modifyDate': {
              'dataType': 'DateTime',
              'description': 'Modification date',
              'allowNull': false,
              'defaultValue': 'currentDate',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_modifyDate'
            },
            'mi_modifyUser': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'User who modify row',
              'allowNull': false,
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_modifyUser'
            },
            'mi_deleteDate': {
              'dataType': 'DateTime',
              'description': 'Deletion date',
              'allowNull': false,
              'defaultValue': 'maxDate',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_deleteDate'
            },
            'mi_deleteUser': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'User who delete row',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_deleteUser'
            }
          },
          'mixins': { 'mStorage': { 'simpleAudit': true, 'safeDelete': true, 'enabled': true } },
          'isFTSDataTable': false,
          'name': 'ubm_enum',
          'entityMethods': { 'select': 1, 'insert': 1, 'update': 1, 'addnew': 1, 'delete': 1 },
          'i18n': {
            'caption': 'Enumerated values',
            'description': 'Enumerated values',
            'attributes': {
              'eGroup': {
                'caption': 'Group',
                'description': ''
              },
              'code': {
                'caption': 'Code',
                'description': 'Value code'
              },
              'shortName': {
                'caption': 'Short name'
              },
              'name': {
                'caption': 'Value name'
              },
              'sortOrder': {
                'caption': 'Order #'
              }
            }
          }
        },
        'tst_blob': {
          'modelName': 'TST',
          'caption': 'BLOBTest',
          'description': 'Test BLOB attributes',
          'connectionName': 'main',
          'sqlAlias': '',
          'descriptionAttribute': 'description',
          'attributes': {
            'ID': {
              'dataType': 'ID',
              'allowNull': false,
              'defaultView': false,
              'name': 'ID'
            },
            'description': {
              'dataType': 'String',
              'size': 255,
              'caption': 'Description',
              'name': 'description'
            },
            'blb': {
              'dataType': 'BLOB',
              'caption': 'BLOB',
              'description': 'Long BLOB value',
              'name': 'blb'
            }
          },
          'mixins': {
            'mStorage': {
              'simpleAudit': false,
              'safeDelete': false,
              'enabled': true
            }
          },
          'isFTSDataTable': false,
          'name': 'tst_blob',
          'entityMethods': {
            'select': 1,
            'insert': 1,
            'update': 1,
            'addnew': 1,
            'delete': 1
          }
        },
        'tst_category': {
          'modelName': 'TST',
          'caption': 'COD docs kind',
          'description': 'Kind of documents, stored in COD',
          'connectionName': 'main',
          'sqlAlias': '',
          'descriptionAttribute': 'code',
          'attributes': {
            'ID': {
              'dataType': 'ID',
              'allowNull': false,
              'defaultView': false,
              'name': 'ID'
            },
            'code': {
              'dataType': 'String',
              'size': 32,
              'caption': 'Code',
              'description': 'Internal code of document kind',
              'allowNull': false,
              'name': 'code'
            },
            'instanceID': {
              'dataType': 'BigInt',
              'caption': 'InstanceID',
              'allowNull': false,
              'name': 'instanceID'
            },
            'ubUser': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'caption': 'Allow for user',
              'allowNull': false,
              'name': 'ubUser'
            }
          },
          'mixins': {
            'mStorage': {
              'simpleAudit': false,
              'safeDelete': false,
              'enabled': true
            }
          },
          'isFTSDataTable': false,
          'name': 'tst_category',
          'entityMethods': {
            'select': 1,
            'insert': 1,
            'update': 1,
            'addnew': 1,
            'delete': 1
          }
        },
        'tst_clob': {
          'modelName': 'TST',
          'caption': 'CLOBTest',
          'description': 'Test CLOB attributes',
          'connectionName': 'main',
          'sqlAlias': '',
          'descriptionAttribute': 'code',
          'attributes': {
            'ID': {
              'dataType': 'ID',
              'allowNull': false,
              'defaultView': false,
              'name': 'ID'
            },
            'description': {
              'dataType': 'String',
              'size': 255,
              'caption': 'Description',
              'name': 'description'
            },
            'text100': {
              'dataType': 'Text',
              'caption': 'Text100',
              'description': 'Long text value truncated to 100',
              'allowSort': false,
              'name': 'text100'
            },
            'text2': {
              'dataType': 'Text',
              'caption': 'Text2',
              'description': 'Long text value truncated to 2',
              'allowSort': false,
              'name': 'text2'
            },
            'text2000': {
              'dataType': 'Text',
              'caption': 'Text2000',
              'description': 'Long text value truncated to 2000',
              'allowSort': false,
              'name': 'text2000'
            },
            'textN': {
              'dataType': 'String',
              'size': 1900,
              'description': 'Long text 1900',
              'name': 'textN'
            },
            'code': {
              'dataType': 'String',
              'size': 64,
              'caption': 'Code',
              'allowNull': false,
              'name': 'code'
            },
            'mi_tr_text100': {
              'dataType': 'String',
              'size': 100,
              'caption': 'Text100(100..)',
              'description': 'Mixin "clobTruncate" autogenerated attribute for truncate text value of "text100" attribute',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_tr_text100'
            },
            'mi_tr_text2': {
              'dataType': 'String',
              'size': 2,
              'caption': 'Text2(2..)',
              'description': 'Mixin "clobTruncate" autogenerated attribute for truncate text value of "text2" attribute',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_tr_text2'
            },
            'mi_tr_text2000': {
              'dataType': 'String',
              'size': 2000,
              'caption': 'Text2000(2000..)',
              'description': 'Mixin "clobTruncate" autogenerated attribute for truncate text value of "text2000" attribute',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_tr_text2000'
            }
          },
          'mixins': {
            'mStorage': {
              'simpleAudit': false,
              'safeDelete': false,
              'enabled': true
            },
            'clobTruncate': {
              'attributeList': {
                'text100': {
                  'size': 100
                },
                'text2': {
                  'size': 2
                },
                'text2000': {
                  'size': 2000
                }
              },
              'enabled': true
            }
          },
          'isFTSDataTable': false,
          'name': 'tst_clob',
          'entityMethods': {
            'select': 1,
            'insert': 1,
            'update': 1,
            'addnew': 1,
            'delete': 1
          }
        },
        'tst_dictionary': {
          'modelName': 'TST',
          'caption': 'tst_dictionary',
          'description': 'ub test dictionary',
          'connectionName': 'main',
          'cacheType': 'SessionEntity',
          'sqlAlias': 'tdict',
          'descriptionAttribute': 'caption',
          'attributes': {
            'ID': {
              'dataType': 'ID',
              'allowNull': false,
              'defaultView': false,
              'name': 'ID'
            },
            'code': {
              'dataType': 'String',
              'size': 32,
              'caption': 'Code',
              'description': 'Code',
              'allowNull': false,
              'name': 'code'
            },
            'caption': {
              'dataType': 'String',
              'size': 255,
              'caption': 'Caption',
              'description': 'Caption',
              'isMultiLang': true,
              'customSettings': {
                'upload': {
                  'name': 'organizationCode',
                  'caption': 'org_organization.code',
                  'additionalColumns': [{
                    'name': 'organizationName',
                    'caption': 'org_organization.name',
                    'example': 'AES-VCM Mong Duong Power'
                  }]
                }
              },
              'name': 'caption'
            },
            'filterValue': {
              'dataType': 'BigInt',
              'caption': 'filterValue',
              'allowNull': false,
              'name': 'filterValue'
            },
            'currencyValue': {
              'dataType': 'Currency',
              'caption': 'Currency Data',
              'name': 'currencyValue'
            },
            'floatValue': {
              'dataType': 'Float',
              'caption': 'Float Data',
              'name': 'floatValue'
            },
            'calculated': {
              'dataType': 'String',
              'size': 255,
              'caption': 'Назва',
              'name': 'calculated'
            },
            'booleanColumn': {
              'dataType': 'Boolean',
              'caption': 'Test boolean column',
              'allowNull': false,
              'defaultValue': '0',
              'name': 'booleanColumn'
            },
            'jsonColumn': {
              'dataType': 'Json',
              'caption': 'Test JSON column',
              'name': 'jsonColumn'
            },
            'mi_owner': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'Row owner',
              'allowNull': false,
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_owner'
            },
            'mi_createDate': {
              'dataType': 'DateTime',
              'description': 'Creation date',
              'allowNull': false,
              'defaultValue': 'currentDate',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_createDate'
            },
            'mi_createUser': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'User who create row',
              'allowNull': false,
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_createUser'
            },
            'mi_modifyDate': {
              'dataType': 'DateTime',
              'description': 'Modification date',
              'allowNull': false,
              'defaultValue': 'currentDate',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_modifyDate'
            },
            'mi_modifyUser': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'User who modify row',
              'allowNull': false,
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_modifyUser'
            },
            'mi_deleteDate': {
              'dataType': 'DateTime',
              'description': 'Deletion date',
              'allowNull': false,
              'defaultValue': 'maxDate',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_deleteDate'
            },
            'mi_deleteUser': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'User who delete row',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_deleteUser'
            }
          },
          'mixins': {
            'mStorage': {
              'simpleAudit': true,
              'safeDelete': true,
              'enabled': true
            }
          },
          'isFTSDataTable': false,
          'name': 'tst_dictionary',
          'entityMethods': {
            'select': 1,
            'insert': 1,
            'update': 1,
            'addnew': 1,
            'delete': 1
          }
        },
        'tst_document': {
          'modelName': 'TST',
          'caption': 'DocumentTest',
          'description': 'Test adtDocument attributes',
          'connectionName': 'main',
          'sqlAlias': '',
          'descriptionAttribute': 'code',
          'attributes': {
            'ID': {
              'dataType': 'ID',
              'allowNull': false,
              'defaultView': false,
              'name': 'ID'
            },
            'code': {
              'dataType': 'String',
              'size': 64,
              'caption': 'Code',
              'allowNull': false,
              'name': 'code'
            },
            'docDate': {
              'dataType': 'Date',
              'caption': 'Document date',
              'name': 'docDate'
            },
            'incomeDate': {
              'dataType': 'Date',
              'caption': 'income date',
              'name': 'incomeDate'
            },
            'regDate': {
              'dataType': 'Date',
              'caption': 'reg date',
              'name': 'regDate'
            },
            'category': {
              'dataType': 'Entity',
              'associatedEntity': 'tst_category',
              'associationAttr': 'instanceID',
              'caption': 'Category',
              'allowNull': false,
              'customSettings': {
                'UIGridColumnClass': 'Categories'
              },
              'name': 'category'
            },
            'favorites': {
              'dataType': 'Entity',
              'associatedEntity': 'tst_category',
              'associationAttr': 'instanceID',
              'caption': 'Favorites',
              'allowNull': false,
              'cascadeDelete': true,
              'customSettings': {
                'UIGridColumnClass': 'Favorites'
              },
              'name': 'favorites'
            },
            'favorites2': {
              'dataType': 'Entity',
              'associatedEntity': 'tst_category',
              'associationAttr': 'instanceID',
              'caption': 'Favorites',
              'allowNull': false,
              'cascadeDelete': true,
              'customSettings': {
                'UIGridColumnClass': 'Favorites'
              },
              'name': 'favorites2'
            },
            'docDateTime': {
              'dataType': 'DateTime',
              'caption': 'Document full date',
              'name': 'docDateTime'
            },
            'description': {
              'dataType': 'String',
              'size': 2000,
              'caption': 'Description',
              'name': 'description'
            },
            'fileStoreSimple': {
              'dataType': 'Document',
              'caption': 'Simple',
              'description': 'Document stored to simple store',
              'allowSort': false,
              'storeName': 'simple',
              'name': 'fileStoreSimple'
            },
            'person': {
              'dataType': 'Entity',
              'associatedEntity': 'cdn_person',
              'caption': 'person',
              'name': 'person'
            },
            'employee': {
              'dataType': 'Entity',
              'associatedEntity': 'cdn_employee',
              'caption': 'employee',
              'name': 'employee'
            },
            'mi_owner': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'Row owner',
              'allowNull': false,
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_owner'
            },
            'mi_createDate': {
              'dataType': 'DateTime',
              'description': 'Creation date',
              'allowNull': false,
              'defaultValue': 'currentDate',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_createDate'
            },
            'mi_createUser': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'User who create row',
              'allowNull': false,
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_createUser'
            },
            'mi_modifyDate': {
              'dataType': 'DateTime',
              'description': 'Modification date',
              'allowNull': false,
              'defaultValue': 'currentDate',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_modifyDate'
            },
            'mi_modifyUser': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'User who modify row',
              'allowNull': false,
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_modifyUser'
            }
          },
          'mixins': {
            'mStorage': {
              'simpleAudit': true,
              'safeDelete': false,
              'enabled': true
            },
            'softLock': {
              'lockIdentifier': 'ID',
              'lockEntity': 'tst_document',
              'enabled': true
            },
            'fts': {
              'scope': 'Connection',
              'dataProvider': 'Mixin',
              'indexedAttributes': ['code', 'description'],
              'dateAttribute': 'docDate',
              'enabled': true
            }
          },
          'isFTSDataTable': false,
          'name': 'tst_document',
          'entityMethods': {
            'fts': 1,
            'ftsreindex': 1,
            'select': 1,
            'addnew': 1,
            'update': 1,
            'delete': 1,
            'unlock': 1,
            'lock': 1,
            'renewLock': 1,
            'isLocked': 1,
            'insert': 1
          }
        },
        'tst_ftsconnection': {
          'modelName': 'TST',
          'caption': 'test fts data with scope=Connection non multi lang',
          'connectionName': 'main',
          'sqlAlias': 'tftsc',
          'descriptionAttribute': 'caption',
          'attributes': {
            'ID': {
              'dataType': 'ID',
              'allowNull': false,
              'defaultView': false,
              'name': 'ID'
            },
            'caption': {
              'dataType': 'String',
              'size': 255,
              'caption': 'Caption',
              'name': 'caption'
            },
            'regDate': {
              'dataType': 'DateTime',
              'caption': 'Registration date',
              'name': 'regDate'
            }
          },
          'mixins': {
            'mStorage': {
              'simpleAudit': false,
              'safeDelete': false,
              'enabled': true
            },
            'fts': {
              'scope': 'Connection',
              'dataProvider': 'Mixin',
              'indexedAttributes': ['caption'],
              'descriptionAttribute': 'caption',
              'dateAttribute': 'regDate',
              'enabled': true
            }
          },
          'isFTSDataTable': false,
          'name': 'tst_ftsconnection',
          'entityMethods': {
            'fts': 1,
            'ftsreindex': 1,
            'select': 1,
            'insert': 1,
            'update': 1,
            'addnew': 1,
            'delete': 1
          }
        },
        'tst_ftsconnection_ml': {
          'modelName': 'TST',
          'caption': 'test fts data with scope=Connection multi lang',
          'connectionName': 'main',
          'sqlAlias': 'tftscml',
          'descriptionAttribute': 'caption',
          'attributes': {
            'ID': {
              'dataType': 'ID',
              'allowNull': false,
              'defaultView': false,
              'name': 'ID'
            },
            'caption': {
              'dataType': 'String',
              'size': 255,
              'caption': 'Caption',
              'isMultiLang': true,
              'name': 'caption'
            },
            'regDate': {
              'dataType': 'DateTime',
              'caption': 'Registration date',
              'name': 'regDate'
            }
          },
          'mixins': {
            'mStorage': {
              'simpleAudit': false,
              'safeDelete': false,
              'enabled': true
            },
            'fts': {
              'scope': 'Connection',
              'dataProvider': 'Mixin',
              'indexedAttributes': ['caption'],
              'descriptionAttribute': 'caption',
              'dateAttribute': 'regDate',
              'enabled': true
            }
          },
          'isFTSDataTable': false,
          'name': 'tst_ftsconnection_ml',
          'entityMethods': {
            'fts': 1,
            'ftsreindex': 1,
            'select': 1,
            'insert': 1,
            'update': 1,
            'addnew': 1,
            'delete': 1
          }
        },
        'tst_ftsentity': {
          'modelName': 'TST',
          'caption': 'test fts data with scope=Entity non multi lang',
          'connectionName': 'main',
          'sqlAlias': 'tftse',
          'descriptionAttribute': 'caption',
          'attributes': {
            'ID': {
              'dataType': 'ID',
              'allowNull': false,
              'defaultView': false,
              'name': 'ID'
            },
            'caption': {
              'dataType': 'String',
              'size': 255,
              'caption': 'Caption',
              'name': 'caption'
            },
            'regDate': {
              'dataType': 'DateTime',
              'caption': 'Registration date',
              'name': 'regDate'
            }
          },
          'mixins': {
            'mStorage': {
              'simpleAudit': false,
              'safeDelete': false,
              'enabled': true
            },
            'fts': {
              'scope': 'Entity',
              'dataProvider': 'Entity',
              'enabled': true
            }
          },
          'isFTSDataTable': false,
          'name': 'tst_ftsentity',
          'entityMethods': {
            'fts': 1,
            'ftsreindex': 1,
            'select': 1,
            'insert': 1,
            'update': 1,
            'addnew': 1,
            'delete': 1,
            'getFTSData': 1
          }
        },
        'tst_histDict': {
          'modelName': 'TST',
          'caption': 'tst_histDict',
          'description': 'Historical dictionary',
          'connectionName': 'main',
          'sqlAlias': '',
          'descriptionAttribute': 'organization',
          'attributes': {
            'ID': {
              'dataType': 'ID',
              'allowNull': false,
              'defaultView': false,
              'name': 'ID'
            },
            'organization': {
              'dataType': 'Entity',
              'associatedEntity': 'org_organization',
              'caption': 'Organization',
              'description': 'Our organization',
              'allowNull': false,
              'name': 'organization'
            },
            'currencyValue': {
              'dataType': 'Currency',
              'caption': 'Currency Data',
              'allowNull': false,
              'defaultValue': '0',
              'name': 'currencyValue'
            },
            'mi_data_id': {
              'dataType': 'Entity',
              'associatedEntity': 'tst_histDict',
              'allowNull': false,
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_data_id'
            },
            'mi_dateFrom': {
              'dataType': 'DateTime',
              'allowNull': false,
              'defaultView': false,
              'name': 'mi_dateFrom'
            },
            'mi_dateTo': {
              'dataType': 'DateTime',
              'allowNull': false,
              'defaultView': false,
              'name': 'mi_dateTo'
            },
            'mi_owner': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'Row owner',
              'allowNull': false,
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_owner'
            },
            'mi_createDate': {
              'dataType': 'DateTime',
              'description': 'Creation date',
              'allowNull': false,
              'defaultValue': 'currentDate',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_createDate'
            },
            'mi_createUser': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'User who create row',
              'allowNull': false,
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_createUser'
            },
            'mi_modifyDate': {
              'dataType': 'DateTime',
              'description': 'Modification date',
              'allowNull': false,
              'defaultValue': 'currentDate',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_modifyDate'
            },
            'mi_modifyUser': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'User who modify row',
              'allowNull': false,
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_modifyUser'
            }
          },
          'mixins': {
            'mStorage': {
              'simpleAudit': true,
              'safeDelete': false,
              'enabled': true
            },
            'dataHistory': {
              'enabled': true
            }
          },
          'isFTSDataTable': false,
          'name': 'tst_histDict',
          'entityMethods': {
            'select': 1,
            'insert': 1,
            'newversion': 1,
            'delete': 1,
            'update': 1,
            'addnew': 1
          }
        },
        'tst_IDMapping': {
          'modelName': 'TST',
          'caption': 'ID mapped',
          'description': 'Test for mapped ID [UB-1219]',
          'connectionName': 'main',
          'sqlAlias': '',
          'descriptionAttribute': 'code',
          'attributes': {
            'ID': {
              'dataType': 'BigInt',
              'caption': 'Ідентифікатор запису',
              'description': 'Ідентифікатор запису',
              'allowNull': false,
              'documentation': 'Ідентифікатор запису',
              'name': 'ID'
            },
            'code': {
              'dataType': 'String',
              'size': 32,
              'caption': 'Code',
              'description': 'Internal code',
              'allowNull': false,
              'name': 'code'
            }
          },
          'mixins': {
            'mStorage': {
              'simpleAudit': false,
              'safeDelete': false,
              'enabled': true
            }
          },
          'isFTSDataTable': false,
          'name': 'tst_IDMapping',
          'entityMethods': {
            'select': 1,
            'insert': 1,
            'update': 1,
            'addnew': 1,
            'delete': 1
          }
        },
        'tst_maindata': {
          'modelName': 'TST',
          'caption': 'ub test main data',
          'description': 'ub test main data',
          'connectionName': 'main',
          'sqlAlias': 'tmd',
          'descriptionAttribute': 'caption',
          'attributes': {
            'ID': {
              'dataType': 'Entity',
              'associatedEntity': 'tst_mainunity',
              'allowNull': false,
              'defaultView': false,
              'name': 'ID'
            },
            'code': {
              'dataType': 'String',
              'size': 32,
              'caption': 'Code',
              'allowNull': false,
              'name': 'code'
            },
            'caption': {
              'dataType': 'String',
              'size': 255,
              'caption': 'Caption',
              'isMultiLang': true,
              'name': 'caption'
            },
            'complexCaption': {
              'dataType': 'String',
              'size': 512,
              'caption': 'complexCaption',
              'name': 'complexCaption'
            },
            'nonNullDict_ID': {
              'dataType': 'Entity',
              'associatedEntity': 'tst_dictionary',
              'caption': 'nonNullDict_ID',
              'allowNull': false,
              'name': 'nonNullDict_ID'
            },
            'nullDict_ID': {
              'dataType': 'Entity',
              'associatedEntity': 'tst_dictionary',
              'caption': 'nullDict_ID',
              'name': 'nullDict_ID'
            },
            'parent': {
              'dataType': 'Entity',
              'associatedEntity': 'tst_maindata',
              'caption': 'parent',
              'name': 'parent'
            },
            'parent1': {
              'dataType': 'Entity',
              'associatedEntity': 'tst_mainunity',
              'caption': 'parent',
              'name': 'parent1'
            },
            'enumValue': {
              'dataType': 'Enum',
              'caption': 'enumValue',
              'allowNull': false,
              'defaultValue': 'ONE',
              'enumGroup': 'TEST_GROUP_1',
              'name': 'enumValue'
            },
            'dateTimeValue': {
              'dataType': 'DateTime',
              'caption': 'dateTimeValue',
              'name': 'dateTimeValue'
            },
            'booleanValue': {
              'dataType': 'Boolean',
              'caption': 'booleanValue',
              'allowNull': false,
              'defaultValue': '0',
              'name': 'booleanValue'
            },
            'fileStoreSimple': {
              'dataType': 'Document',
              'caption': 'Simple',
              'description': 'Document stored to simple store',
              'allowSort': false,
              'storeName': 'simple',
              'name': 'fileStoreSimple'
            },
            'manyValue': {
              'dataType': 'Many',
              'associatedEntity': 'tst_dictionary',
              'associationManyData': 'tst_maind_dict',
              'caption': 'test many data',
              'allowSort': false,
              'name': 'manyValue'
            },
            'manyValue2': {
              'dataType': 'Many',
              'associatedEntity': 'tst_dictionary',
              'associationManyData': 'tst_maind_dict2',
              'caption': 'test 2d many data',
              'allowSort': false,
              'name': 'manyValue2'
            },
            'bigintValue': {
              'dataType': 'BigInt',
              'caption': 'BigInt',
              'defaultValue': '0',
              'name': 'bigintValue'
            },
            'mappedToSelf': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'caption': 'mappedToSelf',
              'documentation': 'For testing DDL Generator - this attribute must be ignored, since it mapped to existed attribute',
              'name': 'mappedToSelf'
            },
            'mi_owner': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'Row owner',
              'allowNull': false,
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_owner'
            },
            'mi_createDate': {
              'dataType': 'DateTime',
              'description': 'Creation date',
              'allowNull': false,
              'defaultValue': 'currentDate',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_createDate'
            },
            'mi_createUser': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'User who create row',
              'allowNull': false,
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_createUser'
            },
            'mi_modifyDate': {
              'dataType': 'DateTime',
              'description': 'Modification date',
              'allowNull': false,
              'defaultValue': 'currentDate',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_modifyDate'
            },
            'mi_modifyUser': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'User who modify row',
              'allowNull': false,
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_modifyUser'
            },
            'mi_deleteDate': {
              'dataType': 'DateTime',
              'description': 'Deletion date',
              'allowNull': false,
              'defaultValue': 'maxDate',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_deleteDate'
            },
            'mi_deleteUser': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'User who delete row',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_deleteUser'
            }
          },
          'mixins': {
            'mStorage': {
              'simpleAudit': true,
              'safeDelete': true,
              'enabled': true
            },
            'unity': {
              'entity': 'tst_mainunity',
              'attributeList': ['code', 'caption'],
              'defaults': {},
              'enabled': true
            }
          },
          'isFTSDataTable': false,
          'name': 'tst_maindata',
          'entityMethods': {
            'select': 1,
            'insert': 1,
            'update': 1,
            'delete': 1,
            'addnew': 1
          }
        },
        'tst_maind_dict': {
          'modelName': 'TST',
          'caption': '',
          'connectionName': 'main',
          'sqlAlias': '',
          'attributes': {
            'sourceID': {
              'dataType': 'Entity',
              'associatedEntity': 'tst_maindata',
              'allowNull': false,
              'cascadeDelete': true,
              'name': 'sourceID'
            },
            'destID': {
              'dataType': 'Entity',
              'associatedEntity': 'tst_dictionary',
              'allowNull': false,
              'name': 'destID'
            }
          },
          'mixins': {},
          'isFTSDataTable': false,
          'name': 'tst_maind_dict',
          'entityMethods': {}
        },
        'tst_maind_dict2': {
          'modelName': 'TST',
          'caption': '',
          'connectionName': 'main',
          'sqlAlias': '',
          'attributes': {
            'sourceID': {
              'dataType': 'Entity',
              'associatedEntity': 'tst_maindata',
              'allowNull': false,
              'cascadeDelete': true,
              'name': 'sourceID'
            },
            'destID': {
              'dataType': 'Entity',
              'associatedEntity': 'tst_dictionary',
              'allowNull': false,
              'name': 'destID'
            }
          },
          'mixins': {},
          'isFTSDataTable': false,
          'name': 'tst_maind_dict2',
          'entityMethods': {}
        },
        'tst_mainunity': {
          'isUnity': true,
          'modelName': 'TST',
          'caption': 'tst_mainunity',
          'description': 'ub test main unity',
          'connectionName': 'main',
          'sqlAlias': 'tmu',
          'descriptionAttribute': 'caption',
          'attributes': {
            'ID': {
              'dataType': 'ID',
              'allowNull': false,
              'defaultView': false,
              'name': 'ID'
            },
            'code': {
              'dataType': 'String',
              'size': 32,
              'caption': 'Code',
              'allowNull': false,
              'name': 'code'
            },
            'caption': {
              'dataType': 'String',
              'size': 255,
              'caption': 'Caption',
              'isMultiLang': true,
              'name': 'caption'
            },
            'mi_deleteDate': {
              'dataType': 'DateTime',
              'description': 'Deletion date',
              'allowNull': false,
              'defaultValue': 'maxDate',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_deleteDate'
            },
            'mi_deleteUser': {
              'dataType': 'Entity',
              'associatedEntity': 'uba_user',
              'description': 'User who delete row',
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_deleteUser'
            },
            'mi_unityEntity': {
              'dataType': 'String',
              'size': 64,
              'allowNull': false,
              'defaultView': false,
              'readOnly': true,
              'name': 'mi_unityEntity'
            }
          },
          'mixins': {
            'mStorage': {
              'simpleAudit': false,
              'safeDelete': true,
              'enabled': true
            }
          },
          'isFTSDataTable': false,
          'name': 'tst_mainunity',
          'entityMethods': {
            'select': 1,
            'insert': 1,
            'update': 1,
            'addnew': 1,
            'delete': 1
          }
        },
        'tst_service': {
          'modelName': 'TST',
          'caption': 'Test servises',
          'description': 'List of test commands',
          'connectionName': 'main',
          'sqlAlias': '',
          'attributes': {},
          'mixins': {},
          'isFTSDataTable': false,
          'name': 'tst_service',
          'entityMethods': {
            'multiply': 1,
            'sleep3sec': 1,
            'uDataTest': 1,
            'ubAbortTest': 1,
            'testDataStoreInitialization': 1,
            'testServerReportPDF': 1,
            'abortTest': 1,
            'throwTest': 1,
            'usualExceptionTest': 1,
            'outOfMemExceptionTest': 1,
            'handledExceptionTest': 1,
            'runAsAdminTest': 1,
            'dmlGeneratorTest': 1,
            'restTest': 1,
            'datesTest': 1
          }
        }
      },
      'models': {
        'UB': {
          'path': 'models/UB',
          'needInit': false,
          'needLocalize': false,
          'order': 0,
          'moduleName': '@unitybase/ub',
          'version': '5.1.2',
          'moduleSuffix': 'public'
        },
        'UBA': {
          'path': 'models/UBA',
          'needInit': false,
          'needLocalize': true,
          'order': 1,
          'moduleName': '@unitybase/uba',
          'version': '5.1.9',
          'moduleSuffix': 'public'
        },
        'UBS': {
          'path': 'models/UBS',
          'needInit': false,
          'needLocalize': true,
          'order': 2,
          'moduleName': '@unitybase/ubs',
          'version': '5.1.40',
          'moduleSuffix': 'public'
        },
        'UBM': {
          'path': 'models/UBM',
          'needInit': true,
          'needLocalize': true,
          'order': 3,
          'moduleName': '@unitybase/ubm',
          'version': '5.1.0',
          'moduleSuffix': 'public'
        },
        'UBQ': {
          'path': 'models/UBQ',
          'needInit': false,
          'needLocalize': false,
          'order': 4,
          'moduleName': '@unitybase/ubq',
          'version': '5.2.6',
          'moduleSuffix': 'public'
        },
        'CDN': {
          'path': 'models/CDN',
          'needInit': false,
          'needLocalize': true,
          'order': 5,
          'moduleName': '@unitybase/cdn',
          'version': '5.0.78',
          'moduleSuffix': 'public'
        },
        'ORG': {
          'path': 'models/ORG',
          'needInit': false,
          'needLocalize': true,
          'order': 6,
          'moduleName': '@unitybase/org',
          'version': '5.1.38',
          'moduleSuffix': 'public'
        },
        'ub-pub': {
          'path': 'models/ub-pub',
          'needInit': false,
          'needLocalize': true,
          'order': 7,
          'moduleName': '@unitybase/ub-pub',
          'version': '5.2.26'
        },
        'adminui-pub': {
          'path': 'models/adminui-pub',
          'needInit': false,
          'needLocalize': true,
          'order': 8,
          'moduleName': '@unitybase/adminui-pub',
          'version': '5.6.19'
        },
        'adminui-reg': {
          'path': 'models/adminui-reg',
          'needInit': false,
          'needLocalize': false,
          'order': 9,
          'moduleName': '@unitybase/adminui-reg',
          'version': '5.1.0',
          'moduleSuffix': 'public'
        },
        'adminui-vue': {
          'path': 'models/adminui-vue',
          'needInit': false,
          'needLocalize': true,
          'order': 10,
          'moduleName': '@unitybase/adminui-vue',
          'version': '1.0.37'
        },
        'TST': {
          'path': 'models/TST',
          'needInit': true,
          'needLocalize': true,
          'order': 11,
          'moduleName': 'tst',
          'version': '1.0.0',
          'moduleSuffix': 'public'
        }
      }
    }), {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'ETag': '"DAFE9E0A"',
        'Server': 'UnityBase'
      }
    }))
  }
  if (event.request.url.includes('ubql')) {
    event.respondWith(event.request.json().then(function (ubqls) {
      let result = []
      ubqls.forEach(ubql => {
        if (ubql.entity === 'tst_dictionary') {
          let data = [
            [1, 'Заголовок 101', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [2, 'Заголовок 102', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [3, 'Заголовок 103', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [5, 'Заголовок 106', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [6, 'Заголовок 107', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [8, 'Заголовок 110', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [9, 'Заголовок 111', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [11, 'Заголовок 113', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [12, 'Заголовок 1144', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [13, 'Заголовок 1151', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [14, 'Заголовок 1154', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [15, 'Заголовок 1155', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [16, 'Заголовок 1156', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [17, 'Заголовок 1157', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [18, 'Заголовок 1158', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [19, 'Заголовок 1159', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [20, 'Заголовок 1120', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [21, 'Заголовок 1121', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [22, 'Заголовок 1122', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [23, 'Заголовок 1123', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [24, 'Заголовок 1124', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [25, 'Заголовок 1125', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [26, 'Заголовок 1126', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [27, 'Заголовок 1127', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [28, 'Заголовок 1128', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [29, 'Заголовок 1129', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [30, 'Заголовок 1130', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [31, 'Заголовок 1131', new Date(2020, 2, 27, 10, 0, 0, 0)],
            [32, 'Заголовок 1132', new Date(2020, 2, 27, 10, 0, 0, 0)]
          ]
          if (ubql.__allowSelectSafeDeleted) {
            data.push(
              [4, 'Заголовок 104', new Date(2018, 2, 27, 10, 0, 0, 0)],
              [7, 'Заголовок 108', new Date(2018, 2, 27, 10, 0, 0, 0)],
              [10, 'Заголовок 112', new Date(2018, 2, 27, 10, 0, 0, 0)]
            )
          }
          result.push({
            'entity': ubql.entity,
            'method': ubql.method,
            'fieldList': ['ID', 'caption', 'mi_deleteDate'],
            'resultData': {
              'fields': ['ID', 'caption', 'mi_deleteDate'],
              'rowCount': 13,
              'data': data
            }
          })
        } else if (ubql.entity === 'tst_maindata') {
          result.push({
            'entity': ubql.entity,
            'method': ubql.method,
            'fieldList': ubql.fieldList,
            'resultData': {
              'fields': ubql.fieldList,
              'rowCount': 1,
              'data': [
                ['Текст заголовка', 'Тақырып мәтіні', 1]
              ]
            }
          })
        } else if (ubql.entity === 'ubm_enum') {
          result.push({
            'entity': ubql.entity,
            'method': ubql.method,
            'fieldList': ubql.fieldList,
            'resultData': {
              'fields': ubql.fieldList,
              'rowCount': 3,
              'data': [
                ['TST1', 'Test1', 'TEST_GROUP_1'],
                ['TST2', 'Long enumeration caption for test must be last in order', 'TEST_GROUP_1'],
                ['TST3', 'Test Enum 3', 'TEST_GROUP_1']
              ]
            }
          })
        } else {
          result.push({
            'entity': ubql.entity,
            'method': ubql.method,
            'fieldList': ubql.fieldList,
            'resultData': {
              'fields': ubql.fieldList,
              'rowCount': 1,
              'data': [
                ubql.fieldList
              ]
            }
          })
        }
      })
      return new Response(JSON.stringify(result), {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'ETag': '"DAFE9E0A"',
          'Server': 'UnityBase Microsoft-HTTPAPI/2.0'
        }
      })
    }))
  }
})
