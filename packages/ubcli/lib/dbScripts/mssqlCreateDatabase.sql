CREATE DATABASE {0};
GO

IF EXISTS(SELECT sid, Name FROM sys.syslogins where name = '{1}')
BEGIN
  DROP LOGIN {1}
END
GO

CREATE LOGIN {1} WITH PASSWORD = N'{2}', CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF;
GO

ALTER DATABASE {0} SET READ_COMMITTED_SNAPSHOT ON;

USE {0};

IF EXISTS( select * from (SELECT FULLTEXTSERVICEPROPERTY('IsFullTextInstalled') as isFTS) f where f.isFTS = 1)
BEGIN
  CREATE FULLTEXT CATALOG ftsDefault AS DEFAULT;
END

