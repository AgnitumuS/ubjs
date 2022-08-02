{
  "caption": "Gebruikerssessies",
  "captionSingular": "Gebruikerssessie",
  "description": "Logged-in user sessions list",
  "documentation": "Read-only access to server-side sessions list of logged-in users",
  "attributes": [
    {
      "name": "ID",
      "caption": "SessionID"
    },
    {
      "name": "userID",
      "caption": "User"
    },
    {
      "name": "userName",
      "caption": "Login"
    },
    {
      "name": "remoteIP",
      "caption": "IP address",
      "description": "IP address user login from"
    },
    {
      "name": "isPasswordExpired",
      "caption": "Password expired",
      "description": "True in case user need to change password because of expiration"
    },
    {
      "name": "isLocked",
      "caption": "Is locked",
      "description": "Blocked because the maximum number of incorrect password entries has exceeded 'UBA.passwordPolicy.maxInvalidAttempts' parameter value"
    },
    {
      "name": "serverTimeDelta",
      "caption": "Time delta",
      "description": "Delta between client and server time"
    },
    {
      "name": "createdAt",
      "caption": "Created at",
      "description": "Session creation time"
    },
    {
      "name": "accessedAt",
      "caption": "Accessed at",
      "description": "Last time the user accessed the server"
    }
  ]
}