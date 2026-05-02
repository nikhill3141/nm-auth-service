# nm-auth-service

A custom **OAuth 2.0 + OpenID Connect (OIDC) Authorization Server** built with Node.js, Express, TypeScript, and MongoDB.

This service allows external clients (applications) to authenticate users, obtain authorization codes, exchange them for tokens, and access user identity data using standard OIDC flows.

---

## Table of Contents

* Overview
* Features
* Tech Stack
* Project Structure
* Environment Setup
* Installation
* Running the Server
* OAuth 2.0 / OIDC Flow (Step-by-Step)
* API Endpoints
* Token Structure
* Security Notes
* Common Errors & Fixes
* Future Improvements

---

## Overview

`nm-auth-service` acts as an **Identity Provider (IdP)**.

It handles:

* User signup and signin
* Client application registration
* Authorization code generation
* Token issuance (access token + ID token)
* User info retrieval

This project follows the **Authorization Code Flow** of OAuth 2.0 with OIDC extensions.

---

## Features

* Client validation using `client_id`
* Authorization Code flow implementation
* JWT-based token system (RS256)
* Public key exposure via JWKS endpoint
* User identity endpoint (`/userinfo`)
* Secure password hashing using crypto
* Session-based flow handling (client + state)

---

## Tech Stack

* Node.js
* Express.js
* TypeScript
* MongoDB (Mongoose)
* JSON Web Tokens (jsonwebtoken)
* node-jose (JWKS handling)

---

## Project Structure

```
src/
├── modules/
│   ├── Client/
│   ├── User/
│   ├── AuthCode/
│   └── OIDC/
├── common/
│   ├── middlewares/
│   └── utils/
├── public/
│   ├── signup.html
│   ├── signin.html
│   └── authError.html
├── index.ts
```

---

## Environment Setup

Create a `.env` file in root:

```
PORT=8000
MONGO_URI=your_mongodb_connection
```

Store your keys securely (do not commit them):

```
PRIVATE_KEY=your_private_key
PUBLIC_KEY=your_public_key
```

---

## Installation

```
npm install
```

---

## Running the Server

Development:

```
npm run dev
```

Production:

```
npm run build
npm start
```

---

## OAuth 2.0 / OIDC Flow (Step-by-Step)

### 1. Client Redirects User

```
GET /nm-auth?
  client_id=CLIENT_ID
  &redirect_uri=CALLBACK_URL
  &response_type=code
  &scope=openid email profile
  &state=RANDOM_STRING
  &nonce=RANDOM_STRING
```

---

### 2. Auth Server Validates Client

* Middleware checks `client_id`
* Fetches client from database
* Stores:

  * clientId
  * redirectUri
  * state

---

### 3. User Signs In / Signs Up

* User submits form
* Server validates credentials
* Creates **Authorization Code**

---

### 4. Redirect with Code

```
redirect_uri?code=AUTH_CODE&state=STATE
```

---

### 5. Client Exchanges Code for Token

```
POST /token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "AUTH_CODE",
  "client_id": "CLIENT_ID",
  "client_secret": "CLIENT_SECRET",
  "redirect_uri": "CALLBACK_URL"
}
```

---

### 6. Server Responds with Tokens

```
{
  "access_token": "...",
  "id_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

---

### 7. Client Fetches User Info

```
GET /userinfo
Authorization: Bearer ACCESS_TOKEN
```

---

## API Endpoints

### OIDC Discovery

```
GET /.well-known/openid-configuration
```

Returns all important endpoints.

---

### JWKS

```
GET /.well-known/jwks.json
```

Returns public keys for token verification.

---

### Authorization Endpoint

```
GET /nm-auth
```

Serves login/signup UI.

---

### Sign Up

```
POST /nm-auth/sign-up
```

Creates a new user.

---

### Sign In

```
POST /nm-auth/sign-in
```

Authenticates user and generates auth code.

---

### Token Endpoint

```
POST /token
```

Exchanges auth code for tokens.

---

### User Info

```
GET /nm-auth/userinfo
```

Returns user profile data.

---

## Token Structure

### ID Token (OIDC)

Contains:

* iss (issuer)
* sub (user id)
* aud (client id)
* email
* name
* exp (expiry)

---

### Access Token

Used for:

* Accessing protected APIs
* Fetching user info

---

## Security Notes

* Never expose private keys in GitHub
* Always validate `redirect_uri`
* Use short expiry for auth codes (5–10 minutes)
* Always verify `state` to prevent CSRF
* Use HTTPS in production
* Store secrets in environment variables

---

## Common Errors & Fixes

### invalid_client

* client_id mismatch
* wrong DB query field

---

### invalid_grant

* expired auth code
* reused code
* redirect_uri mismatch

---

### Cast to ObjectId failed

* Using string instead of ObjectId
* Fix by consistent ID type

---

### Cannot destructure req.body

* Missing `express.json()` middleware

---

### Headers already sent

* Sending multiple responses in same request

---

## Future Improvements

* Refresh Token support
* PKCE (Proof Key for Code Exchange)
* Role-based access
* Rate limiting
* Audit logging
* Multi-tenant client support

---

## Final Notes

This project is a learning-focused implementation of OAuth 2.0 and OIDC.

For production:

* Follow full OIDC spec
* Add security layers
* Perform proper audits

---
