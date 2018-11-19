#  Package ub-server@5.4.6->5.4.7
### Added:
 - `Buffer.from(str, 'base64')` can decode MIME Base64 - a base64 separated by `\r\n`,
 and base64 without paddings (without necessary `=` in the end)
### Fixed:
 - `Buffer.from(str, 'base64')` will correclty decode base64 string if it is in 2-byte representation.
  This may happens in case string is extracted from enother string with non-latin characters,
  for example from XMLs
 - x5 speed up of `Buffer.from(str, 'base64')`
 - SQL builder for PostgreSQL will not lost scale when selecting float attribute form related many entity.
    - New many expression template: `SELECT string_agg(ATTRIBUTE::text, ',')`
    - Previous many template: `SELECT string_agg(to_text(ATTRIBUTE, '99999999'), ',')`
 - Unix: release memory mapped files ASAP

#  Package adminui-pub@5.6.5->5.6.8
### Added:
 - add UbExtension.crx to the adminui-pub/ub-extension folder.
 Used by client who do not have access to the internet but need to install extension into Google Chrome.
### Changed:
 - in case default form for entity is not defined and exists several forms
 `UB.core.UBFormLoader.getFormByEntity` will return form with smallest code (in alphabetic order)
### Fixed:
 - add polyfill for Promise unhandledrejection event (for FireFox browser).
 Without this polyfill Admin-ui can't show unhandledrejection's reason in message box
   
 - EntityGridPanel - prevent monkey request in Refresh action by removing reloading of
   EntityGridPanel.stores, because they already will be reloaded by UBStore.linkedItemsLoadList 

#  Package cdn@5.0.52->5.0.66
### Changed:
 - cdn_city: allow to select Country as a parent admin unit for city (filter on the form)
 - cdn_region: allow to select any admin unit as a region parent (in prev implementation
 select was limited by COUNTRY). See #19 for changes reasons

#  Package ub-pub@5.2.17->5.2.19
### Added:
 - If quite the same request repeated 2 or more times in the last 100ms (so called monkey request) then 
 it putted into the `console.error`    

#  Package uba@5.1.0->5.1.1
### Fixed:
 - fix update/insert of uba_usercertificate (setBlob method)

#  Package ubm@5.0.61->5.0.66
### Added:
 - In PRODUCTION mode form editor will show warning box about page reloading for applying changes  

#  Package xlsx@5.0.26->5.0.31
### Added:
 - preserve spaces is cells by default (required for creating indents)
### Fixed:
 - columns properties was applied in incorrect order
