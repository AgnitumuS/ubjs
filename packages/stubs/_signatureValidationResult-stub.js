/**
 * A crypto-library independent signature validation result
 * @typedef SignatureValidationResult
 * @memberOf module:buildin
 * @property {boolean} valid Is signature match document
 * @property {string} errorMessage filled in case valid is false
 * @property {number} errorCode Error code from library
 * @property {string} warnings Optional warnings about signatures (for example - annotations in PDF)
 * @property {boolean} tspValid Is timestamp retrieved from authorised source (not from local computer)
 * @property {boolean} ocspVerified Is signer certificate status verified during signing
 * @property {boolean} hardwareKeyUsed Is hardware token used to made signature
 * @property {Date} signingTime Time of signing. In case tspValid this time is taken from authorised source using TSP protocol, in other case - this is **UNTRUSTED** time of local signer computer
 * @property {Boolean} isDigitalStamp Is signature certificate is a digital time stamp
 * @property {string} signAlgo Signature algorithm (DSTU-4145,  RSA,  ECDSA)
 * @property {string} signType Type of signature (Qualified, Advanced)
 * @property {string} mediaSerial For hardware keys - serial number of hardware key
 *
 * @property {Object} certificate Signer certificate information. In case valid===false certificate may not exist (or broken) and this property is empty object
 * @property {String} certificate.certKind Certificate kind ('Qualified' \ 'Advanced')
 * @property {String} certificate.keyUsage String with key usage information
 * @property {String} certificate.serial Certificate serial number
 * @property {Date} certificate.validFrom Certificate valid starting from this date
 * @property {Date} certificate.validTo Certificate valid up to this date
 * @property {Object} certificate.issuedBy Certificate issuer info
 * @property {String} certificate.issuedBy.orgName Organization name what issue certificate
 * @property {String} certificate.issuedBy.fullName Authority name what issue certificate
 * @property {String} certificate.issuedBy.country Authority location country
 * @property {String} certificate.issuedBy.locality Authority location locality
 * @property {String} certificate.issuedBy.issuerID Authority ID
 * @property {String} [certificate.issuedBy.orgUnit] Authority organization unit
 * @property {ArrayBuffer} [certificate.certificateAsBuffer] Signer certificate in bin format
 *
 * @property {Object} subject Individual who owns a certificate. In case valid===false certificate may not exists (or broken) and this property is empty object
 * @property {Object} [subject.DRFO] Individual DRFO (of ID card number in some cases)
 * @property {Object} subject.fullName Individual full name. Can be empty for stamps?
 * @property {String} subject.country Individual location country
 * @property {String} subject.locality Individual location locality
 * @property {String} [subject.eMail] Individual e-mail
 * @property {String} [subject.phone] Individual phone number
 *
 * @property {Object} organization Organization where individual who owns a certificate works. In case of self-employed individual all fields are empty
 * @property {String} organization.EDRPOU Organization EDRPOU
 * @property {String} organization.orgName Organization EDRPOU
 * @property {String} organization.digitalStampName In case certificate.isDigitalStamp===true contains stamp name
 * @property {String} organization.position Position of individual within the organization
 * @property {String} [organization.orgUnit] Department within the organization where individual works
 */
