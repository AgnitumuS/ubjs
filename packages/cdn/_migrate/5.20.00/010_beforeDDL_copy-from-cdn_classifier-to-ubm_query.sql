<% if (conn.dialect.startsWith('Postgre')) { %>

--
INSERT INTO ubm_query (
  ID,
  code,
  name,
  name_ru,
  name_uk,
  ubql,
  type,
  mi_unityEntity,
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
  '{}',
  'classifier',
  'cdn_clasdifier',
  mi_owner,
  mi_createdate,
  mi_createuser,
  mi_modifydate,
  mi_modifyuser,
  mi_deletedate,
  mi_deleteuser
FROM cdn_classifier classifier
WHERE NOT EXISTS (
  SELECT ID
  FROM ubm_query query
  WHERE query.ID = classifier.ID
);
--

<% } else if (conn.dialect.startsWith('MSSQL')) { %>

--
INSERT INTO dbo.ubm_query (
  ID,
  code,
  name,
  name_ru,
  name_uk,
  ubql,
  type,
  mi_unityEntity,
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
  '{}',
  'classifier',
  'cdn_clasdifier',
  mi_owner,
  mi_createdate,
  mi_createuser,
  mi_modifydate,
  mi_modifyuser,
  mi_deletedate,
  mi_deleteuser
FROM dbo.cdn_classifier classifier
WHERE NOT (EXISTS (
  SELECT ID
  FROM dbo.ubm_query query
  WHERE query.ID = classifier.ID
));
--

<% } else if (conn.dialect.startsWith('Oracle')) { %>

--
INSERT INTO ubm_query (
  ID,
  code,
  name,
  name_ru,
  name_uk,
  ubql,
  type,
  mi_unityEntity,
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
  '{}',
  'classifier',
  'cdn_clasdifier',
  mi_owner,
  mi_createdate,
  mi_createuser,
  mi_modifydate,
  mi_modifyuser,
  mi_deletedate,
  mi_deleteuser
FROM cdn_classifier classifier
WHERE NOT (EXISTS (
  SELECT ID
  FROM ubm_query query
  WHERE query.ID = classifier.ID
));
--
<% } %>
