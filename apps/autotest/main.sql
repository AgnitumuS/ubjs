--##############     start script for conection "main" #######
 
-- Create tables
--#############################################################
create table dbo.uba_els(
	ID BIGINT null,
	code NVARCHAR(32) null,
	description NVARCHAR(255) null,
	disabled NUMERIC null CONSTRAINT els_DISABLED_DEF  default 0,
	entityMask NVARCHAR(128) null,
	methodMask NVARCHAR(128) null,
	ruleType NVARCHAR(32) null CONSTRAINT els_RULETYPE_DEF  default 'A',
	ruleRole BIGINT null,
	mi_owner BIGINT null,
	mi_createDate DATETIME null CONSTRAINT els_MI_CREATEDATE_DEF  default getutcdate(),
	mi_createUser BIGINT null,
	mi_modifyDate DATETIME null CONSTRAINT els_MI_MODIFYDATE_DEF  default getutcdate(),
	mi_modifyUser BIGINT null
)
 
-- Create primary keys
--#############################################################
alter table dbo.uba_els add constraint PK_ELS PRIMARY KEY CLUSTERED(ID)
 
-- Create indexes
--#############################################################
 create  index IDX_ELS_RULEROLE on dbo.uba_els(RULEROLE);
--
 create  index IDX_ELS_MI_OWNER on dbo.uba_els(MI_OWNER);
--
 create  index IDX_ELS_MI_CREATEUSER on dbo.uba_els(MI_CREATEUSER);
--
 create  index IDX_ELS_MI_MODIFYUSER on dbo.uba_els(MI_MODIFYUSER)
 
-- Create check constraint
--#############################################################
alter table dbo.uba_els add constraint CHK_ELS_disabled_BOOL check (disabled in (0,1))
 
-- Create foreign keys
--#############################################################
alter table dbo.uba_els add constraint FK_ELS_RULEROLE_REF_ROLE foreign key (RULEROLE references dbo.uba_role(ID);
--
alter table dbo.uba_els add constraint FK_ELS_MI_OWNER_REF_USR foreign key (MI_OWNER references dbo.uba_user(ID);
--
alter table dbo.uba_els add constraint FK_ELS_MI_CREATEUSER_REF_USR foreign key (MI_CREATEUSER references dbo.uba_user(ID);
--
alter table dbo.uba_els add constraint FK_ELS_MI_MODIFYUSER_REF_USR foreign key (MI_MODIFYUSER references dbo.uba_user(ID)
 
-- Annotate an objects
--#############################################################
EXEC sp_addextendedproperty @name = N'Caption', @value = N'Які ролі мають права доступу до методів метабази',@level0type = N'SCHEMA',  @level0name= N'dbo', @level1type = N'TABLE',  @level1name = N'uba_els';
--
EXEC sp_addextendedproperty @name = N'Caption', @value = N'',@level0type = N'SCHEMA',  @level0name= N'dbo', @level1type = N'TABLE',  @level1name = N'uba_els', @level2type = N'Column', @level2name = 'ID';
--
EXEC sp_addextendedproperty @name = N'Caption', @value = N'Код ELS правила',@level0type = N'SCHEMA',  @level0name= N'dbo', @level1type = N'TABLE',  @level1name = N'uba_els', @level2type = N'Column', @level2name = 'code';
--
EXEC sp_addextendedproperty @name = N'Caption', @value = N'Опис правила',@level0type = N'SCHEMA',  @level0name= N'dbo', @level1type = N'TABLE',  @level1name = N'uba_els', @level2type = N'Column', @level2name = 'description';
--
EXEC sp_addextendedproperty @name = N'Caption', @value = N'Правило відключено',@level0type = N'SCHEMA',  @level0name= N'dbo', @level1type = N'TABLE',  @level1name = N'uba_els', @level2type = N'Column', @level2name = 'disabled';
--
EXEC sp_addextendedproperty @name = N'Caption', @value = N'Маска сутності',@level0type = N'SCHEMA',  @level0name= N'dbo', @level1type = N'TABLE',  @level1name = N'uba_els', @level2type = N'Column', @level2name = 'entityMask';
--
EXEC sp_addextendedproperty @name = N'Caption', @value = N'Маска методів',@level0type = N'SCHEMA',  @level0name= N'dbo', @level1type = N'TABLE',  @level1name = N'uba_els', @level2type = N'Column', @level2name = 'methodMask';
--
EXEC sp_addextendedproperty @name = N'Caption', @value = N'Тип правила',@level0type = N'SCHEMA',  @level0name= N'dbo', @level1type = N'TABLE',  @level1name = N'uba_els', @level2type = N'Column', @level2name = 'ruleType';
--
EXEC sp_addextendedproperty @name = N'Caption', @value = N'Роль, для якої застосовувати правило',@level0type = N'SCHEMA',  @level0name= N'dbo', @level1type = N'TABLE',  @level1name = N'uba_els', @level2type = N'Column', @level2name = 'ruleRole';
--
EXEC sp_addextendedproperty @name = N'Caption', @value = N'Row owner',@level0type = N'SCHEMA',  @level0name= N'dbo', @level1type = N'TABLE',  @level1name = N'uba_els', @level2type = N'Column', @level2name = 'mi_owner';
--
EXEC sp_addextendedproperty @name = N'Caption', @value = N'Creation date',@level0type = N'SCHEMA',  @level0name= N'dbo', @level1type = N'TABLE',  @level1name = N'uba_els', @level2type = N'Column', @level2name = 'mi_createDate';
--
EXEC sp_addextendedproperty @name = N'Caption', @value = N'User who create row',@level0type = N'SCHEMA',  @level0name= N'dbo', @level1type = N'TABLE',  @level1name = N'uba_els', @level2type = N'Column', @level2name = 'mi_createUser';
--
EXEC sp_addextendedproperty @name = N'Caption', @value = N'Modification date',@level0type = N'SCHEMA',  @level0name= N'dbo', @level1type = N'TABLE',  @level1name = N'uba_els', @level2type = N'Column', @level2name = 'mi_modifyDate';
--
EXEC sp_addextendedproperty @name = N'Caption', @value = N'User who modify row',@level0type = N'SCHEMA',  @level0name= N'dbo', @level1type = N'TABLE',  @level1name = N'uba_els', @level2type = N'Column', @level2name = 'mi_modifyUser'