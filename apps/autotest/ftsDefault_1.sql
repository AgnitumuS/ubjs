--##############     start script for conection "ftsDefault" #######
-- Create tables
--#############################################################
CREATE VIRTUAL TABLE tst_ftsentity_uk USING fts4(
	ID VARCHAR(64) NULL PRIMARY KEY,
	entity VARCHAR(64) NULL,
	ftsentity VARCHAR(64) NULL,
	dy VARCHAR(4) NULL,
	dm VARCHAR(2) NULL,
	dd VARCHAR(2) NULL,
	datacode VARCHAR(128) NULL,
	aclrls VARCHAR(4000) NULL,
	entitydescr VARCHAR(512) NULL,
	databody VARCHAR(4000) NULL
,tokenize=stemka lang=uk);
--
CREATE VIRTUAL TABLE ftsDefault_uk USING fts4(
	ID VARCHAR(64) NULL PRIMARY KEY,
	entity VARCHAR(64) NULL,
	ftsentity VARCHAR(64) NULL,
	dy VARCHAR(4) NULL,
	dm VARCHAR(2) NULL,
	dd VARCHAR(2) NULL,
	datacode VARCHAR(128) NULL,
	aclrls VARCHAR(4000) NULL,
	entitydescr VARCHAR(512) NULL,
	databody VARCHAR(4000) NULL
,tokenize=stemka lang=uk);
--
 