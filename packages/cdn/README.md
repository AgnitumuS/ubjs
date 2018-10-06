Set of dictionaries appropriate for majority of enterprise systems.

For internal organization structure see `@ubitybase/org` module

# Used `ubs_setting` keys

 - `cdn.organization.accessAddGovByRoles` - comma separated use role names for whom is allowed 
 to add/edit organization with `isGovAuthority == true`. If empty - allowed for any role
 
 - `cdn.organization.allowAutoGenerateOKPO` Boolean. If `true` and `cdn.organization.OKPOCode` if not filled 
 will generate if automatically during insertion. Default `false` 


