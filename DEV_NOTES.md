# Developer Notes - Database Migration & User Accounts

## ⚠️ Database Migration & User Logins
The database for the Rasaji application was recently migrated to Neon PostgreSQL. Because of this:
- Existing recipe data has been migrated and seeded into the new database.
- User accounts from the previous local SQLite database were **not** migrated.
- As a result, old users will not be able to log in with their previous credentials and will receive a "Email belum terdaftar" or wrong password error.
- **Action Required**: Users with accounts created on the old database need to register again in order to create a new record in the current PostgreSQL database.
