const UB = require('@unitybase/ub')
const App = UB.App

function runTest () {
  const st = UB.DataStore('uba_user')
st.execSQL(`
DECLARE anID NUMBER(19,0);
begin
  select ID INTO anID from uba_user where ID > :ID: and name <> :name: FETCH FIRST 1 ROWS ONLY;
  anID := 10;
END;
`,
    { ID: 10, name: '123' }
  )
  // st.execSQL(`
  //   /* mock callContragentUpdate */
  //   declare
  //     R CREATOR.CONTRAGENT%ROWTYPE;
  //   begin
  //     select * into R
  //     from CREATOR.CONTRAGENT C
  //     where C.ID = :ID:
  //     FETCH FIRST 1 ROWS ONLY;
  //
  //     R.ADDR_HOUSENO := :ADDR_HOUSENO:;
  //     R.ADDR_CITY := :ADDR_CITY:;
  //     R.ADDR_COUNTRYID := :ADDR_COUNTRYID:;
  //     R.ADDR_DISTRICT := :ADDR_DISTRICT:;
  //     R.ADDR_FLAT := :ADDR_FLAT:;
  //     R.ADDR_POSTCODE := :ADDR_POSTCODE:;
  //     R.ADDR_REGION := :ADDR_REGION:;
  //     R.ADDR_REGIONALCODEID := :ADDR_REGIONALCODEID:;
  //     R.ADDR_STREET := :ADDR_STREET:;
  //     R.ALTERNATENAME := :ALTERNATENAME:;
  //     R.BIRTHCOUNTRYID := :BIRTHCOUNTRYID:;
  //     R.BIRTHPLACE := :BIRTHPLACE:;
  //     R.BUSINESSTYPE1 := :BUSINESSTYPE1:;
  //     R.BUSINESSTYPE2 := :BUSINESSTYPE2:;
  //     R.BUSINESSTYPE3 := :BUSINESSTYPE3:;
  //     R.BUSINESSTYPE4 := :BUSINESSTYPE4:;
  //     R.BUSINESSTYPE5 := :BUSINESSTYPE5:;
  //     R.BUSINESSTYPE6 := :BUSINESSTYPE6:;
  //     R.BUSINESSTYPE7 := :BUSINESSTYPE7:;
  //     R.BUSINESSTYPE8 := :BUSINESSTYPE8:;
  //     R.BUSINESSTYPE9 := :BUSINESSTYPE9:;
  //     R.BUSINESSTYPE10 := :BUSINESSTYPE10:;
  //     R.CLIENTBIRTHDAY := TO_DATE(:CLIENTBIRTHDAY:, 'DDMMYYYY');
  //     R.CLIENTLASTNAME := :CLIENTLASTNAME:;
  //     R.CLIENTNAME := :CLIENTNAME:;
  //     R.CLIENTPATRONYMICNAME := :CLIENTPATRONYMICNAME:;
  //     R.CLIENTTYPEK014 := :CLIENTTYPEK014:;
  //     R.CONTRAGENTTYPEID := :CONTRAGENTTYPEID:;
  //     R.COUNTRYID := :COUNTRYID:;
  //     R.EMAIL := :EMAIL:;
  //     R.FIRSTNAME_LAT := :FIRSTNAME_LAT:;
  //     R.ID := :ID:;
  //     R.IDENTIFYCODE := :IDENTIFYCODE:;
  //     R.ISPUBLICPERSON := :ISPUBLICPERSON:;
  //     R.JURADDR_HOUSENO := :JURADDR_HOUSENO:;
  //     R.JURADDR_COUNTRYID := :JURADDR_COUNTRYID:;
  //     R.JURADDR_CITY := :JURADDR_CITY:;
  //     R.JURADDR_DISTRICT := :JURADDR_DISTRICT:;
  //     R.JURADDR_FLAT := :JURADDR_FLAT:;
  //     R.JURADDR_POSTCODE := :JURADDR_POSTCODE:;
  //     R.JURADDR_REGION := :JURADDR_REGION:;
  //     R.JURADDR_REGIONALCODEID := :JURADDR_REGIONALCODEID:;
  //     R.JURADDR_STREET := :JURADDR_STREET:;
  //     R.LASTNAME_LAT := :LASTNAME_LAT:;
  //     R.MOBILEPHONE := :MOBILEPHONE:;
  //     R.NALOGREGISTERNO := :NALOGREGISTERNO:;
  //     R.NAME := :NAME:;
  //     R.NICKNAME := :NICKNAME:;
  //     R.OWNERSHIPTYPEID := :OWNERSHIPTYPEID:;
  //     R.PASSPORTENDDATE := TO_DATE(:PASSPORTENDDATE:, 'DDMMYYYY');
  //     R.PASSPORTISSUEDATE := TO_DATE(:PASSPORTISSUEDATE:, 'DDMMYYYY');
  //     R.PASSPORTISSUEPLACE := :PASSPORTISSUEPLACE:;
  //     R.PASSPORTNO := :PASSPORTNO:;
  //     R.PASSPORTTYPE := :PASSPORTTYPE:;
  //     R.PASSPORT_NO := :PASSPORT_NO:;
  //     R.PASSPORT_SERIAL := :PASSPORT_SERIAL:;
  //     R.PHONES := :PHONES:;
  //     R.SECONDNAME_LAT := :SECONDNAME_LAT:;
  //     R.SNAME := :SNAME:;
  //     R.STATEREGISTERDATE := TO_DATE(:STATEREGISTERDATE:, 'DDMMYYYY');
  //     R.STATEREGISTERNO := :STATEREGISTERNO:;
  //     R.STATEREGISTERPLACE := :STATEREGISTERPLACE:;
  //     R.TAXPAYERCODE := :TAXPAYERCODE:;
  //     R.WORKPLACE := :WORKPLACE:;
  //     R.WORKPOSITION := :WORKPOSITION:;
  //
  //     CREATOR.PKI_ACCOUNTCONTR_API.CONTRAGENT_UPDATE(P_CONTRAGENTREC => R);
  //   end;
  // `, {
  //   ID: 0,
  //   // As is
  //   ADDR_HOUSENO: ''
  //   // ADDR_CITY: cd.placeOfLiving.city,
  //   // ADDR_COUNTRYID: cd.placeOfLiving.country,
  //   // ADDR_DISTRICT: cd.placeOfLiving.district,
  //   // ADDR_FLAT: cd.placeOfLiving.apartment,
  //   // ADDR_POSTCODE: cd.placeOfLiving.postcode,
  //   // ADDR_REGION: cd.placeOfLiving.area,
  //   // ADDR_REGIONALCODEID: cd.placeOfLiving.areaID,
  //   // ADDR_STREET: cd.placeOfLiving.street,
  //   // BIRTHCOUNTRYID: cd.birthplace.country,
  //   // BIRTHPLACE: cd.birthplace.city,
  //   // BUSINESSTYPE1: cd.businessActivities[0],
  //   // BUSINESSTYPE2: cd.businessActivities[1],
  //   // BUSINESSTYPE3: cd.businessActivities[2],
  //   // BUSINESSTYPE4: cd.businessActivities[3],
  //   // BUSINESSTYPE5: cd.businessActivities[4],
  //   // BUSINESSTYPE6: cd.businessActivities[5],
  //   // BUSINESSTYPE7: cd.businessActivities[6],
  //   // BUSINESSTYPE8: cd.businessActivities[7],
  //   // BUSINESSTYPE9: cd.businessActivities[8],
  //   // BUSINESSTYPE10: cd.businessActivities[9],
  //   // CLIENTLASTNAME: cd.fullFIO.lastName,
  //   // CLIENTNAME: cd.fullFIO.firstName,
  //   // CLIENTPATRONYMICNAME: cd.fullFIO.middleName,
  //   // CONTRAGENTTYPEID: cd.type,
  //   // COUNTRYID: cd.nationality,
  //   // EMAIL: cd.contacts.email,
  //   // FIRSTNAME_LAT: cd.transliteratedFullFIO.firstName,
  //   // IDENTIFYCODE: cd.personalCode,
  //   // ISPUBLICPERSON: cd.isPublic,
  //   // JURADDR_HOUSENO: cd.jurAddrPlace.building,
  //   // JURADDR_CITY: cd.jurAddrPlace.city,
  //   // JURADDR_COUNTRYID: cd.jurAddrPlace.country,
  //   // JURADDR_DISTRICT: cd.jurAddrPlace.district,
  //   // JURADDR_FLAT: cd.jurAddrPlace.apartment,
  //   // JURADDR_POSTCODE: cd.jurAddrPlace.postcode,
  //   // JURADDR_REGION: cd.jurAddrPlace.area,
  //   // JURADDR_REGIONALCODEID: cd.jurAddrPlace.areaID,
  //   // JURADDR_STREET: cd.jurAddrPlace.street,
  //   // LASTNAME_LAT: cd.transliteratedFullFIO.lastName,
  //   // MOBILEPHONE: cd.contacts.phone,
  //   // NALOGREGISTERNO: cd.personalCode,
  //   // NICKNAME: cd.ID,
  //   // PASSPORTISSUEPLACE: cd.ownPassport.issued,
  //   // PASSPORTTYPE: cd.ownPassport.type,
  //   // PASSPORT_NO: cd.ownPassport.number,
  //   // PASSPORT_SERIAL: cd.ownPassport.series,
  //   // PHONES: cd.contacts.additionalPhone,
  //   // SECONDNAME_LAT: cd.transliteratedFullFIO.middleName,
  //   // STATEREGISTERNO: cd.entrepreneurRegistration.number,
  //   // STATEREGISTERPLACE: cd.entrepreneurRegistration.issuedBy,
  //   // TAXPAYERCODE: cd.personalCode,
  //   // WORKPLACE: cd.work.workPlace,
  //   // WORKPOSITION: cd.work.workPosition,
  //   // // Evaluated
  //   // ALTERNATENAME: util.b2.getNormalizedFIO({
  //   //   lastName: cd.transliteratedFullFIO.lastName
  //   // }),
  //   // CLIENTTYPEK014: mapping.get('CLIENTTYPEK014.ID').of('CONTRAGENTTYPE.CID', cd.type),
  //   // CLIENTBIRTHDAY: cd.birthDate
  //   //   ? moment(cd.birthDate).format('DDMMYYYY')
  //   //   : null,
  //   // NAME: util.b2.getFIO(cd.fullFIO),
  //   // OWNERSHIPTYPEID: cd.isResident
  //   //   ? OWNERSHIPTYPE.ID.RESIDENT
  //   //   : OWNERSHIPTYPE.ID.NOT_RESIDENT,
  //   // PASSPORTENDDATE: cd.ownPassport.endDate
  //   //   ? moment(cd.ownPassport.endDate).format('DDMMYYYY')
  //   //   : null,
  //   // PASSPORTISSUEDATE: cd.ownPassport.issueDate
  //   //   ? moment(cd.ownPassport.issueDate).format('DDMMYYYY')
  //   //   : null,
  //   // PASSPORTNO: util.b2.getPassportDescriptor({
  //   //   series: cd.ownPassport.series,
  //   //   number: cd.ownPassport.number
  //   // }),
  //   // SNAME: util.b2.getFIO({
  //   //   lastName: cd.fullFIO.lastName
  //   // }),
  //   // STATEREGISTERDATE: cd.entrepreneurRegistration.date
  //   //   ? moment(cd.entrepreneurRegistration.date).format('DDMMYYYY')
  //   //   : null
  // })
}

(function () {
  let res = { success: true }
  try {
    runTest()
  } catch (e) {
    res.success = false
    res.reason = e.message + ' Stack: ' + e.stack
  }
  module.exports = res
  return res
})()
