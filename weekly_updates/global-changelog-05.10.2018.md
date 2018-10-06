#  Package adminui-pub@5.5.8->5.6.2
### Added:
 - attributes of type `Json` now supported by adminUI
 - New @cfg `valueIsJson` added to `UBCodeMirror`. If true value can be plain JS object. In other case - string 
### Fixed:
 - grid export to HTML - empty (null) Float/Currency/Int now exported as empty cell instead of "NaN"
 - regression in generation grid column caption for `EntityGrinPanel`
 - grid export to HTML - empty (null) date now exported as empty cell instead of 1970 year
 - cached entity filtration by boolean attribute from EntityGridPanel filter widget:
 filtration value should be `true/false` instead `1/0`

#  Package cs-shared@5.0.0->5.0.10
### Added:
 - new convert rule is added for attributes of type `Json` in `getConvertRules` function  
 - `UBEntity.getEntityAttributeInfo` in case of request to inner keys of Json type attribute
 will return actual Json attribute in `parentAttribute` and `attribute: ubndefined`
### Changed:
 - `UBEntity.getEntityAttributeInfo` speed up from x10 to x100 (avoid calling String.split if not necessary)
 - `UBEntity.getEntityAttributeInfo` will return additional parameter `parentAttribute`
### Fixed:
 - `UBEntity.getEntityAttributeInfo` will return correct entity (listed after @) for
 cases `domain.get('org_unit').getEntityAttributeInfo('parentID.code@org_department')`.
 Previous implementation return `org_unit` for such query. 

#  Package org@5.1.0->5.1.19
### Fixed:
 - generation of `org_employeeonstaff.caption`: in case `org_employee.shortFIO` is empty - use `org_employee.lastName`
 [unitybase/ubjs#14]. Deletion of `org_employeeonstaff` is fixed inside server ( ub >= v5.3.3) 

#  Package ub@5.0.38->5.0.43
### Changed:
- `docflow` related legacy code is removed from `RLS.js` (known as $ in "rls" mixin expression)

#  Package ub-pub@5.2.10->5.2.14
### Added:
 - `UBConnection.update` and `UBConnection.insert` can accept Object as execParams value.
 Such Objects will be stringified before passing request to server   
### Fixed:
 - `UBConnection.update` and `UBConnection.insert` should not stringify null values - in other case `null` become "null" string    
 - [unitybase/ubjs#16] - default indexedDB name is changed from `/` to `ub`, because FF can't create indexedDB with name `/` 

#  Package ubcli@5.0.40->5.1.2
### Added:
- `ubcli generateDDL` now support Json type attributes
### Fixed:
 - [unitybase/ubjs#15] - Postgre DDl generator must use `SELECT nextval('${sequenceObj}')` for sequence incrementing
 - database initialization scripts will create DDL for uba_els.code & uba_els.ruleType 
 as NVARCHAR instead of VARCHAR as in current metadata
 - return back creation of sequences for cached entities (lost during ub1.12 -> ub5 migration).
  This patch speed up getting of cached entities cache version (especially for large tables)
   and fix [unitybase/ubjs#15] for all DB except SQLite3 