-- Set valid mi_unityEntity = 'ubm_sysdictionary' for entries of ubm_query entity mapped from the ubm_sysdictionary entity
-- Migration _migrate/5.20.00/010_beforeDDL_prepare-ubm_query.sql left an ID's value there

update ubm_query set
  mi_unityEntity = 'ubm_sysdictionary'
where
  mi_unityEntity <> 'ubm_sysdictionary'
  and id in (select sd.id from ubm_sysdictionary sd);
