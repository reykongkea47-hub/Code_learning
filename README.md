# CodeLearning — Full-Stack Scaffold

A learning-platform starter with three parts:

```
CodeLearning/
├── Backend_API/        PHP + PostgreSQL (PDO) REST-style API
├── Frontend_User/      Student-facing site (browse courses, sign up, log in)
└── Frontend_admin/     Admin dashboard (log in, add courses)
```

## 1. Backend setup

1. Create the database and load the schema:
   ```bash
   createdb code_learning
   psql code_learning < Backend_API/schema.sql
   ```
2. Copy `.env.example` to `.env` inside `Backend_API/` and fill in your real
   PostgreSQL credentials:
   ```bash
   cp Backend_API/.env.example Backend_API/.env
   ```
3. Serve the folder with PHP's built-in server (or point Apache/Nginx at it):
   ```bash
   cd Backend_API
   php -S localhost:8000
   ```
4. Visit `http://localhost:8000/` — you should see the welcome JSON response.

**Endpoints:**
| Method | Path                        | Notes                          |
|--------|-----------------------------|---------------------------------|
| POST   | `/api/auth/register.php`    | Create a student account       |
| POST   | `/api/auth/login.php`       | Log in (starts a session)      |
| POST   | `/api/auth/logout.php`      | Destroy the session             |
| GET    | `/api/courses/index.php`    | List all courses               |
| POST   | `/api/courses/index.php`    | Create a course (**admin only**)|

To make your own account an admin, run this in `psql` after signing up:
```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

## 2. Frontend setup

Both `Frontend_User/` and `Frontend_admin/` are static HTML/CSS/JS — no build
step needed. Open `index.html` (user) or `login.html` (admin) directly, or
serve the folder with any static server.

In `js/app.js` (both frontends), update this line to match where your backend
is running:
```js
const API_BASE = "http://localhost:8000"; // or your deployed API URL
```

## 3. Notes on what changed from your original files

- Database credentials moved out of PHP and into a `.env` file (not committed
  to version control) — hardcoding passwords in source is a common way they
  leak into git history or public repos.
- `singup.html` → `signup.html` (typo fix).
- Passwords are hashed with `password_hash()` / verified with
  `password_verify()` — never stored or compared as plain text.
- Course creation is restricted to logged-in users with `role = 'admin'`.
