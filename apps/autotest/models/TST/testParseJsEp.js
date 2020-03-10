const UB = require('@unitybase/ub')
const App = UB.App
App.registerEndpoint('testParseJsEp', testParseJsEp, false)

/**
 * Performance test of parsing ubql in JS vs Native
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function testParseJsEp (req, resp) {
  // const txt = req.read()
  // const inArray = JSON.parse(txt)
  //const inArray = req.json()
  //inArray.length;
  resp.statusCode = 200
  resp.writeEnd({})
}

// inputCmdArray := TubListArray.Create;
// try
// // read ubListArray from SentData
// JSONToObject(inputCmdArray, PUTF8Char(Ctxt.Call.InBody), isValid);
// if (not isValid) or (inputCmdArray.Count = 0) then
// raise EMetabaseException.CreateByCode(UBEXC_INVALIDDATAFORRUNMETHODLIST);
//
// //move elements of ubArr to RubMethodParams array
// SetLength(prmArr, inputCmdArray.Count); // initial inputCmdArray empty, so values are intializat do 0/nil
// for i := 0 to inputCmdArray.Count - 1 do begin
//   prmArr[i].init(Ctxt, nil, inputCmdArray[i]);
//
// // check UB_ENTITY parameter
// if not inputCmdArray[i].testStr(UB_ENTITY, rstr) then
// raise EMetabaseException.CreateByCode(UBEXC_NO_ENTITY_PARAMETER);
//
// ett := Domain.byName(rstr); // Domain is sorted for binary earch (in TubApp.InitializeInThreadContext)
// if (ett = nil) then
// raise EMetabaseException.CreateByCodeFmt(UBEXC_ENTITY_NOT_EXIST, [rstr]);
//
// // check UB_METHOD parameter
// if not inputCmdArray[i].testStr(UB_METHOD, methodName) then
// raise EMetabaseException.CreateByCode(UBEXC_NO_METHOD_PARAMETER);
//
// prmArr[i].rootMethod := ett.methods.byName(methodName);
// if prmArr[i].rootMethod = nil then
// raise EMetabaseException.CreateByCodeFmt(UBEXC_NOT_IMPLEMENTED_ERRNUM, [methodName, ett.name]);
//
// prmArr[i].ownedDataStore := TubDataStore.Create(ett, Ctxt);
// prmArr[i].RunProps := DEFAULT_MIXIN_RUNPROPS;
// prmArr[i]._callType := cctExternal;
//
// MP := prmArr[i].mParams;
// for k := MP.Count-1 downto 0 do begin
// // client must not send parameter  __skipOptimisticLock for first request
// // in case request for same mParams.execParams.ID exist in prev. runList items we allow to pass __skipOptimisticLock
// // for example if we need to update entity twice in one transaction (one runList call)
// if (MP[k].Name = UB_SPN_skipOptimisticLock) then begin
// curID := getIDFrom_mParams_ExecParams(MP);
// mustDelete := curID < 0; // if ID not passed then delete __skipOptimisticLock
// // is any prev. request with such ID exist? (except select request)
// if not mustDelete then for j := 0 to i-1 do
//   if (prmArr[j].rootMethod.entity.mSelect <> prmArr[j].rootMethod) and // prev. method not select method
//     (getIDFrom_mParams_ExecParams(prmArr[j].mParams) = curID) then begin // and ID is the same
// mustDelete := false; // do not delete __skipOptimisticLock
// break;
// end;
// if mustDelete then
// MP.Delete(k)
// else
// Include(prmArr[i].RunProps, mpSkipOptimisticLock);
// end else if (MP[k].Name = UB_SPN_allowSelectSafeDeleted) then begin
// // check parameter allow select safe deleted
// // if parameter exists, delete it from mParams
// if (MP[k].valType = lvtBoolean) and MP[k].boolVal then
// Include(prmArr[i].RunProps, mpAllowSelectSafeDeleted);
// MP.delete(k);
// end else if (MP[k].Name = UB_SPN_skipRls) or ((MP[k].Name = UB_SPN_skipAclRls)) then begin
// // check parameter skip rls / aclRLS
// // if parameter exists, delete it from mParams (only for internal call)
// MP.Delete(k);
// end else if (MP[k].Name = UB_SPN_skipAclRls) then begin
// // check parameter skip aclRls
// // if parameter exists, delete it from mParams
// MP.Delete(k);
// end else if (MP[k].Name = UB_SPN_skipSelectAfterUpdate) then begin
// // check parameter skip select after update
// // if parameter exists, delete it from mParams
// if (MP[k].valType = lvtBoolean) and MP[k].boolVal then begin
// Exclude(prmArr[i].RunProps, mpDoSelectAfterUpdate);
// MP.Delete(k);
// end;
// end else if (MP[k].Name = UB_SPN_skipSelectAfterInsert) then begin
// // check parameter skip select after insert
// // if parameter exists, delete it from mParams
// if (MP[k].valType = lvtBoolean) and MP[k].boolVal then begin
// Exclude(prmArr[i].RunProps, mpDoSelectAfterInsert);
// MP.Delete(k);
// end;
// end;
// end;
// prmArr[i].OriginalParams.Assign(MP);
// // Mark every sql-item as external. Warning! after all check before ubRunMethod
// SetExternalMarkOnList(prmArr[i].mParams);
//
// // run method. transaction(s) rollbacked/commited in  launchCallback
// // NOP ubRunMethod(prmArr[i], prmArr[i].rootMethod, mcoNormal, True{checkELS})
// end;