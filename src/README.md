# CRM Backend (Node.js + MySQL)

## Project Structure

```
src/
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── branch/
│   ├── tasks/
│   └── companies/
│
├── config/
├── core/
│   ├── middleware/
│   ├── utils/
│   ├── constants/
│   └── error-handler.js
├── uploads/
├── app.js
└── server.js
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and update values as needed.
3. Run database migrations (if any).
4. Start the server:
   ```bash
   npm start
   ```

## Features
- Super Admin creation
- JWT authentication with httpOnly cookies
- User and Branch management
- Input validation and error handling

## Notes
- Use the `/api/auth/super-admin` endpoint to create the first Super Admin.
- All other endpoints require authentication. 

PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=crm
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=1h
COOKIE_NAME=auth_token
COOKIE_SECURE=false       # set to true in production (HTTPS)
COOKIE_SAMESITE=lax        # or 'none' for cross-site, with secure=true
NODE_ENV=development