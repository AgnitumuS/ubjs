## Introduction

UnityBase is platform for building complex enterprise application. So security is one of most important part of platform. UnityBase security mechanism includes:

*   Users, Groups, And Security Roles (UBA model)
*   different types of authentication and authorization - modified DIGEST, Kerberos, via public/private key, using LDAP
*   encrypted communication - either HTTPS or more secure internal mechanism
*   audit - all operation is logged to audit tables (both old and new values are logged)
*   simple row level audit - ability to memorize creator, modifier and owner of each entity row
*   safe delete - ability to mark entity row as deleted without psychically delete it from database (or other store)
*   data history - ability to track history of entity row modification and show row content on specified date
*   entity-level security (ELS) - ability to restrict access to entity methods
*   row-level security (RLS) - ability to restrict access to entity data based on row attribute values
*   access control list (ACL) - ability to restrict access to entity data based on security principal assigned for each entity row
*   attribute-level security (ALS) - ability to restrict access to entity attribute values based on different criteria
*   record signing - ability to sign entity attributes using electronic signature
*   PDF signing - ability to sign PDF documents, including visual signatures
*   advanced logging mechanism - almost everything server do can be logged without performance lost

## Users, Groups, And Security Roles

A user is an entity that can be authenticated. A user can be a person or a software entity, such as other information systems. 
Each user is given a unique name. For efficient security management, we recommends adding users to groups. 
A group is a collection of users who usually have something in common, such as working in the same department in a company 
or perform a similar tasks, such as "document registration". 
**Groups, users, and user to role assignments are usually created by the supervisor** - person in organization, 
who monitors and regulates employees and their access rights.
   
A security role is an identity granted to users or groups based on specific conditions. 
Multiple users or groups can be granted the same security role and a user or group can be in more than one security role. 
Security roles are used by Entity-Level Security (ELS) policies to determine who can access a entity methods. 
It also defines the set of the `endpoints` to which access is allowed.
**Security roles and ELS policies are usually created by the application developer**. 

### Build-in roles
Table below lists the build-in roles UnityBase define by default. **Do not delete these roles**  - they are used in the default ELS policies.

| Role name | Default ELS rules... | Endpoints granted | Granted to groups... |
|-----------|----------------------|-------------------|----------------------|
| Admin     | All entity methods are allowed | All endpoints are granted | |
| Supervisor| All rights for Users & Groups management. Soft-lock removing| | |
| Developer | Reserved for change entity definitions | | |
| Monitor   | Application statistics | stat| | 
| User      | Read for common dictionaries (cdn* org*), UI (ubm*) and settings (ubs_settings)| logout,changePassword | | 
| Anonymous | None | | |
| Everyone  | | auth,timeStamp,statics,getAppInfo,models,getDomainInfo,ubql | |

Roles `Anonymous`, `Everyone` and `User` are runtime roles. It assigned automatically by UnityBase server:
 
  - `User`. This role contains all users who have been authenticated
  - `Anonymous`. This role is assigned to any non-authorized user
  - `Everyone`. This role for any anonymous users and all users who have been authenticated

We recommends that you add at least one user to the Admin role in addition to the `admin` user. 
Having at least two administrators at all times helps protect against a single admin user being locked out from a potential security breach. 

## Authorization & authentication

### What Is The Difference Between Authentication And Authorization?

**Authentication**

Authentication verifies **who you are**. For example, you can login into your Unix server using the ssh client,
or access your email server using the POP3 and SMTP client.

**Authorization**

Authorization verifies **what you are authorized to do**. For example, you are allowed to login into your Unix server
via ssh client, but you are not authorized to browser /data2 or any other file system. Authorization occurs after
successful authentication. Authorization can be controlled at file system level or using various application level
configuration options such as chroot(2).

Usually, the connection attempt must be both authenticated and authorized by the system. You can easily find out why
connection attempts are either accepted or denied with the help of these two factors.

### UnityBase authentication schemas

UnityBase support several authentication algorithm with different level of security.
While configuring your application you can set `security.authenticationMethods` config parameter to array or possible supported
authentication algorithm.

|Authentication schema | Description | Authorization method |
|----------------------|-------------|----------------------|
| Basic                | HTTP Basic. Not recommended for a production| Basic |
| UB                   | Modified DIGEST |  UB |
| UBLDAP               | Based on a LDAP catalog | UB |
| UBIP                 | Based on a caller IP. For a server <-> server communication | UBIP |
| Negotiate            | SSO using MS Windows domain. Enterprise edition only | UB |
| CERT                 | Based on a private/public keys. Defence edition only | UB |
| [OpenIDConnect](https://en.wikipedia.org/wiki/OpenID_Connect) | Authentication layer on top of OAuth 2.0 | UB |
| [JWT](https://jwt.io/)| JSON Web Token - coming soon  | JWT |

Some schemas have it own authorization some are only for a authentication - the last column it the table above note a
 authorization method.

### UB authorization
If future client requests are authorized using UB method, the task of authentication is to elaborate two parameters
between client and server: **clientSessionID** and **sessionPrivateKey**.
With knowledge of a `secretWord` - something only client is know, we can calculate a authentication header and add it
to every request what require authentication.

After authentication all requests to a serve must include a `Authorization: UB signature` header,
where `signature` is:

    signature = hexa8(clientSessionID) + hexaTime + hexa8(crc32(sessionPrivateKey + secretWord + hexaTime));

Adding a time to a `signature` prevent from a relplay attack (server check time is growing in each request).

For any request server MAY response with `401` - this mean session is expired and client must repeat the authorization.

Authorization signature calculation (JavaScript):

    function hexa8(value){
        var num = parseInt(value, 10),
            res = isNaN(num) ? '00000000' : num.toString(16);
        while(res.length < 8) {
            res = '0' + res;
        }
        return res;
    };

     function getSignature() {
     var
        timeStampI = Math.floor((new Date()).getTime() /  1000),
        hexaTime = hexa8(timeStampI);

        return  hexa(clientSessionID) + hexaTime + hexa8(crc32(sessionPrivateKey + secretWord + hexaTime));
     }


## UnityBase Administration (UBA) model

The basis of all security mechanism is UnityBase Administration (UBA) model. To enable build-in security developer must
include UBA model to application domain.

This model define entities:

*  uba_role - security roles list
*  uba_user - user list
*  uba_userrole - user roles
*  uba_usercertificate - user certificates (used for public/private key authentication schema)
*  uba_els - entity level security information
*  uba_als - attribute-level security information
*  uba_audit - audit of security related operations
*  uba_subject - unity for uba_user and uba_role entities. Used as security principal for RLS and ACL security

If model UBA is not included into domain, UnityBase work in "authentication not used" mode. In this mode there is no
Session context for method execution. This mode can be used in several cases:

*   for simple services what not require authentication
*   during database initialization
*   for test or developing purpose

Also developer can turn on "authentication not used" mode by comment `"authMethods"` section in application config.

### Password policy

 For authentication schemas what based on a password, stored in the `uba_user` entity (Basic, UB & CERT) administrator
can define a policies. The policies is stored in the `ubs_settings` entity, so the UBS model must be
in application domain. In other case default values are applied.

|Parameter | Description | Default value |
|----------|-------------|---------------|
| `UBA.passwordPolicy.maxDurationDays` | Password expiration. Calculated form a last password change date. After *maxDurationDays* days user can't access any endpoint except *changePassword* and *logout*. That is, to continue the work the user must change the password.| 0 (unlimited) |
| `UBA.passwordPolicy.checkPrevPwdNum` | When user change password new one must not be equal to a *checkPrevPwdNum* previous passwords. If it is equal en error *Previous password is not allowed* is rised | 4 |
| `UBA.passwordPolicy.minLength`       | Minimal password length in chars. If user password length less to **minLength** *Password is too short* exception raised | 3 |
| `UBA.passwordPolicy.checkCmplexity`  | If `true` server will check password must contains upper & lower case letters, numbers and special chars [~!@#$%^&***()_+\\=\-\/'":;<>]. If not - exception *Password is too simple* is raised | false |
| `UBA.passwordPolicy.checkDictionary` | Check the password are not a word from a dictionary. If so - *Password is dictionary word* error is raised | false |
| `UBA.passwordPolicy.allowMatchWithLogin` | Check password not match the user name. If so - *Password matches with login* error is raised | false |
| `UBA.passwordPolicy.maxInvalidAttempts` | After *maxInvalidAttempts* unsuccessful authorization user will be locked (`uba_user.disabled=1`). All attempts will logged to `uba_audit` as  *LOGIN FAILED* or *LOCKED LOGIN FAILED* events | 0 (unlimited) |

Note, that for some of these settings, you will need to restart UnityBase server after the change.
Setting value is a localizable string, make sure you update the setting in all the languages.

### Security audit & dashboard
All security related operations are added to the `uba_audit` entity. The interface part is available in the `adminUI` on the path
`Administrator -> Security -> Security audit`.

For user, specified in the `UBA.securityDashboard.supervisorUser` setting key (by default this is `admin` user) also available a
`Security monitor` ( `Administrator -> Security -> Security monitor` ) feature, where all security related events are logged in the real time.
For a real-time communication WebSockets must be turned on both server and client side - see {@tutorial web_sockets}.

## Additional features of Enterprise edition
### Kerberos authentication

#### Linux

UnityBase Enterprise edition supports Kerberos authentication on Linux using gssapi. UnityBase binary is compiled against MIT implementation of gssapi library.
Internally the implementation of Kerberos authentication supports only one authentication iteration while RFC 2743 defines multiple iterations - this is a known implementation limitation.
Despite there are some plugins for gssapi library that define NTLM support, use of such plugins is neither recommended nor functional. For Kerberos authentication to work properly it is recommended to setup domain to use SPNEGO authentication mechanism.

To prepare UnityBase to use Kerberos authentication on Linux a number of steps should be done:

1. Preparation of network interfaces
1. Installation of packages required
1. realmd configuration
1. Joining the Linux Server to Active Directory
1. Configuring Active Directory
1. Creating keytab file for UnityBase service
1. Configuring UnityBase to support Kerberos authentication

Most of the steps above are clearly described in a document for configuring Microsoft SQL Sever to use Windows authentication which can be found at [https://www.mssqltips.com/sqlservertip/5075/configure-sql-server-on-linux-to-use-windows-authentication](https://www.mssqltips.com/sqlservertip/5075/configure-sql-server-on-linux-to-use-windows-authentication). These steps are described here only briefly.

##### Preparation of network interfaces
Network interfaces on the Linux server should be configured in the way that the server is on the same network as Domain Controller is and the server can resolve names withing Domain Controller's network.
To achieve this an actions described in the document above could be done. By the way as a result "nslookup <DC_name>" should be resulted in actual Domain Controller's address.
This may be required to check here an availability of desired ports if some filters are active in the network.
At the moment a change of the name of the Linux server may be required to follow the domain's policies.

##### Installation of packages required
A few packages should be installed on the Linux server to prepare it to join an Active Directory domain, including:
 - samba libraries and tools
 - sssd libraries and tools
 - MIT kerberos implementation libraries and tools including gssapi library
Here is a list of packages that could be applicable:
  realmd krb5-user sssd-ad samba-common-bin samba-libs sssd-tools krb5-user adcli
When installing the packages a prompt for default realm should appear. Please note that it is required to enter the full (not short NETBIOS form) realm name in uppercase.

This is also worth to mention that time on the Linux server should be synchronized with Domain Controller's one. For this purpose it is recommended to have ntpd installed of the server and ntpd configured to take time from Domain Controller.

##### realmd configuration
Before joining Active Directory realmd service should be properly configured.
In the document above there is a good example of /etc/realmd.conf file to be taken.
After the realmd.conf file is created it is needed to (re) start realmd service.

##### Joining the Linux Server to Active Directory
Everything is now ready to join the domain. This may be done by issuing the following command:

    realm join [your_domain.com] -U '[user_with_rights_to_add_computer_to_domain@YOUR_DOMAIN.COM]' -v

Please note that domain name should be provided using capital letters and this should be the full domain name.
When the command successfully finishes, the Linux server become a member of the Active Directory domain.

##### Configuring Active Directory
It's now time to prepare Active Directory to know about UnityBase.
Either computer's account or some special user account could be used by UnityBase service. The account should have "Logon as a service" right.
In either case it is a good practice to create Service Principal Name for UnitBase service and associate it with the account chosen. As UnityBase is a Web (http) service, the SPN should correspond to the following schema:

    HTTP/Fully_Qualified_Domain_Name_of_the_Server[:Listening_Port]

Listening_Port is an optional component. it is recommended to add it when UnityBase listens on non default http|https port (not 80 or 443)
Use setspn utility on Domain Controller or any Windows computer joined to the same domain to create SPN.

##### Creating keytab file for UnityBase service
On the Linux server service's credentials are stored as keytab file. ktutil is used to create such a file on Linux.
Look at the document on configuring MS SQL Server mentioned above to see how to prepare the keytab file. Don't forget about user rights - UnityBase local account should be able to read the file.
Below is a list of the commands used:

    kinit <user@REALM.COM>
    kvno <SPN>
    ktutil
 
    addent -password -p <SPN@REALM.COM> -k <no_from_kvno> -e aes256-cts-hmac-sha1-96
    addent -password -p <SPN@REALM.COM> -k <no_from_kvno> -e rc4-hmac
    write_kt /path/to/file.keytab
    quit

##### Configuring UnityBase to support Kerberos authentication
The final step is to provide configuration information to UnityBase.
It is mandatory to specify the keytab file to be used by UnityBase to authenticate itself in the domain. This is done by specifying KRB5_KTNAME environment variable for UnityBase process. It is better to specify it just at the call to ub:

    KRB5_KTNAME=/path/to/file.keytab ub

UnityBase server configuration file should also be changed. At least 'Negotiate' should be specified in the list of authentication providers. It is also strongly recommended to specify SPN parameter in the "security" section - the SPN string here shuld be written in wide form, with realm specified: SPN@REALM.COM. It should be exactly the same as the name inside the keytab.


## Additional features in Defence edition
UnityBase Defense edition provide additional security features.
In the security environment instead of usual HTML browsed UBDefenseBrowser - a chromium based Web browser must be used.

### Integrity checking of the application components

UnityBase Defense edition provide a mechanism of self-checking components integrity.

#### Application server
For the application server the subject of integrity checking are:

 - Application server `bin` folder content
 - Application configuration file
 - Files and subfolders* in models folders (models listen in the configuration file)
 - Files and subfolders* in inetPub folder (defined in serverConfig.httpServer.inetPub)
 
* Files and folders whose names begin with "_" is ignored during checksum calculation

After set up application on the production environment, the first step is to calculate an application integrity. 
Command:

	>ub -calcIntegrity  

will calculate a MD5 checksum of all application components and write it to `system32` folder in the file UB_[applicationServerURL], 
where applicationServerURL is a full URL of current application. 
This folder accessible for write only for operation system Administrator, so the command should be executed using Administrator rights.

Every time application is starting, UnityBase will calculate a current application checksum and compare it with checksum, 
calculated by `-calcIntegrity` command. If the checksums do not match the application will be terminated with exit code = 1.

#### Client side
For the UBDefenseBrowser the subject of integrity checking are:

 - UBDefenseBrowser browser itself and all it components
 - offline application part

After set up UBDefenseBrowser on the client, the first step is to calculate an application integrity. 
Command:

	>RunSecureBrowser.cmd -calcIntegrity  

will calculate a CRC32 checksum of all client components.

Every time client part is starting, it will calculate a current checksum and compare it with checksum, 
calculated by `-calcIntegrity` command. If the checksum do not match the application will be terminated with exit code = 1.

#### File downloads
UBSecureBrowsed limit a folder where user can store downloaded files to the folder, specified in `downloadFolder` parameter.
(by default `%USERPROFILE%\Downloads`). In any case all downloads will be logged to the `uba_audit`
with `action=DOWNLOAD` and `fromValue=full path to stored file`.
