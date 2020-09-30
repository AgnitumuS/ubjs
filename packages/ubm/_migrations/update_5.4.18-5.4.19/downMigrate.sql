
DELETE FROM ubm_desktop_acl
WHERE ID IN (
  SELECT ID from ubm_desktop_adm
)

DELETE FROM ubm_navshortcut_acl
WHERE ID IN (
  SELECT ID from ubm_navshortcut_adm
)
