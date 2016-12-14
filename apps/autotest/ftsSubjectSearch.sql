--##############     start script for conection "ftsSubjectSearch" #######
 
-- Create tables
--#############################################################
CREATE VIRTUAL TABLE ftsSubjectSearch_uk USING fts4(
	ID VARCHAR(64) NULL PRIMARY KEY,
	entity VARCHAR(64) NULL,
	ftsentity VARCHAR(64) NULL,
	dy VARCHAR(4) NULL,
	dm VARCHAR(2) NULL,
	dd VARCHAR(2) NULL,
	datacode VARCHAR(128) NULL,
	aclrls VARCHAR(4000) NULL,
	entitydescr VARCHAR(512) NULL,
	databody VARCHAR(4000) NULL,
	snippet VARCHAR(4000) NULL,
	rank INTEGER NULL
,tokenize=stemka lang=uk)