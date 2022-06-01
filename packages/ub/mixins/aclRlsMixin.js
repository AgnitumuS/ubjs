/**
 * `aclRls` mixin implements a Row Level Security based on Access Control List.
 * See [File system storage tutorial](https://unitybase.info/api/server-v5/tutorial-mixins_fsstorage.html) for details.
 *
 * Configuration
 * "mixins": {
 *   "aclRls": {
 *     "useUnityName": false,
 *     "onEntities": ["entity_one", ....],
 *     "entityConnectAttr": "ID",
 *     "exprMethod": "methodWhatCreatesSubQuery",
 *     "selectionRule": "Exists", // "In"
 *     "model": "modelWhereToCreateAclRlsStorageEntity"
 *   }
 * }
 *
 * @implements MixinModule
 */
