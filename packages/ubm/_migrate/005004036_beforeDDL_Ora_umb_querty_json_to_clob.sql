<% if (conn.dialect.startsWith('Oracle')) { %>
ALTER TABLE ubm_query ADD (ubql_c CLOB);
--
UPDATE ubm_query SET ubql_c = ubql WHERE 1=1;
--
ALTER TABLE ubm_query DROP COLUMN ubql;
--
ALTER TABLE ubm_query RENAME COLUMN ubql_c TO ubql;
--
<% } %>