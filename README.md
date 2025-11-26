# LockBox - Node + Express backend (skeleton)

This repository contains a simple Node.js + Express backend skeleton implementing authentication and a basic vault (password items) API.

Quick notes:
- Backend only (no frontend, no Docker) as requested.
- Use a MySQL database; this code uses `mysql2` with a connection pool.
- Environment variables must be provided by you (see sample below).

Install (run locally):

```powershell
npm init -y
npm install express dotenv mysql2 bcrypt jsonwebtoken
npm install -D nodemon
```

Run:

```powershell
# development
npm run dev

# or production
npm start
```

Sample `.env` (DO NOT create this file automatically; this is an example of what you should provide):

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=lockbox_db
PORT=3000
JWT_SECRET=your_jwt_secret_here
```

Project structure:

```
package.json
.gitignore
README.md
src/
  server.js
  config/
    db.js
  middleware/
    authMiddleware.js
  routes/
    auth.js
    vault.js
  controllers/
    authController.js
    vaultController.js
  models/
    userModel.js
    vaultModel.js
```

Database schema (example SQL) — not executed here:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vault_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255),
  username VARCHAR(255),
  password TEXT,
  url VARCHAR(512),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

If you want, I can also add SQL migration files or help wiring a local MySQL instance.
