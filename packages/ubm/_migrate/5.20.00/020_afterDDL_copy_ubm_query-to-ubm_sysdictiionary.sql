<% if (conn.dialect.startsWith('Postgre')) { %>

--
INSERT INTO ubm_sysdictionary (
  ID,
  code,
  name,
  name_ru,
  name_uk,
  ubql,
  mi_owner,
  mi_createdate,
  mi_createuser,
  mi_modifydate,
  mi_modifyuser,
  mi_deletedate,
  mi_deleteuser
)
SELECT
  ID,
  code,
  name,
  name_ru,
  name_uk,
  ubql,
  mi_owner,
  mi_createdate,
  mi_createuser,
  mi_modifydate,
  mi_modifyuser,
  mi_deletedate,
  mi_deleteuser
FROM ubm_query query
WHERE NOT EXISTS (
  SELECT ID
  FROM ubm_sysdictionary sysdict
  WHERE sysdict.ID = query.ID
);
--

<% } else if (conn.dialect.startsWith('MSSQL')) { %>

--
INSERT INTO dbo.ubm_sysdictionary (
  ID,
  code,
  name,
  name_ru,
  name_uk,
  ubql,
  mi_owner,
  mi_createdate,
  mi_createuser,
  mi_modifydate,
  mi_modifyuser,
  mi_deletedate,
  mi_deleteuser
)
SELECT
  ID,
  code,
  name,
  name_ru,
  name_uk,
  ubql,
  mi_owner,
  mi_createdate,
  mi_createuser,
  mi_modifydate,
  mi_modifyuser,
  mi_deletedate,
  mi_deleteuser
FROM dbo.ubm_query query
WHERE NOT (EXISTS (
  SELECT ID
  FROM dbo.ubm_sysdictionary sysdict
  WHERE sysdict.ID = query.ID
));
--

<% } else if (conn.dialect.startsWith('Oracle')) { %>

--
INSERT INTO ubm_sysdictionary (
  ID,
  code,
  name,
  name_ru,
  name_uk,
  ubql,
  mi_owner,
  mi_createdate,
  mi_createuser,
  mi_modifydate,
  mi_modifyuser,
  mi_deletedate,
  mi_deleteuser
)
SELECT
  ID,
  code,
  name,
  name_ru,
  name_uk,
  ubql,
  mi_owner,
  mi_createdate,
  mi_createuser,
  mi_modifydate,
  mi_modifyuser,
  mi_deletedate,
  mi_deleteuser
FROM ubm_query query
WHERE NOT ( EXISTS (
  SELECT ID
  FROM ubm_sysdictionary sysdict
  WHERE sysdict.ID = query.ID
));
--

<% } %>
