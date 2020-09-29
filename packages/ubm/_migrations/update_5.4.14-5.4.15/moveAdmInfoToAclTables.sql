
INSERT INTO ubm_desktop_acl (ID, instanceID, subjID, valueID)
SELECT genid, instanceID, admSubjID, admSubjID FROM ubm_desktop_adm

INSERT INTO ubm_navshortcut_acl (ID, instanceID, subjID, valueID)
SELECT genid, instanceID, admSubjID, admSubjID FROM ubm_navshortcut_adm
