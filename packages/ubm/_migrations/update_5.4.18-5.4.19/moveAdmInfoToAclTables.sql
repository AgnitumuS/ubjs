

INSERT INTO ubm_desktop_acl (ID, instanceID, subjID, valueID)
SELECT ID, instanceID, admSubjID, admSubjID FROM ubm_desktop_adm adm
WHERE NOT EXISTS (
  SELECT ID FROM ubm_desktop_acl acl
  WHERE acl.instanceID = adm.instanceID and acl.subjID = adm.admSubjID
)

INSERT INTO ubm_navshortcut_acl (ID, instanceID, subjID, valueID)
SELECT ID, instanceID, admSubjID, admSubjID FROM ubm_navshortcut_adm adm
WHERE NOT EXISTS (
  SELECT ID FROM ubm_navshortcut_acl acl
  WHERE acl.instanceID = adm.instanceID and acl.subjID = adm.admSubjID
)
