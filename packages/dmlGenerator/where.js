/**
 * Created by v.orel on 13.01.2017.
 */
class WhereList {
  constructor (builder) {
    this.builder = builder
  }
  add (item) {
    // todo
/*
 fBldWhereItem := WhereList.AddNamed(fSQLWhereItem.name);
 fBldWhereItem.Condition := fSQLWhereItem.Condition;
 fBldWhereItem.SubQueryType := fSQLWhereItem.subQueryType;
 fBldWhereItem.IsExternal := fSQLWhereItem.isExternal;
     */
    return {item}
  }
  createSubQueryBuilder (entity) {
    // todo
    return {entity}
  }
}

module.exports = WhereList