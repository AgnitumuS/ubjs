-- help migration that is not applied by default can be used to rollback changes made
-- by the `010_move-entries-from-adm-to-acl-tables.sql` migration script
DELETE FROM ubm_desktop_acl
WHERE ID IN (
  SELECT ID from ubm_desktop_adm
)
--
DELETE FROM ubm_navshortcut_acl
WHERE ID IN (
  SELECT ID from ubm_navshortcut_adm
)
--
