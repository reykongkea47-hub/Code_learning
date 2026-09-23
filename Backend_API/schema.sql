-- Run this once against your `code_learning` PostgreSQL database.

CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'student', -- 'student' | 'admin'
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(150) NOT NULL,
    description TEXT,
    instructor  VARCHAR(100),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Optional: create a first admin user (change email/password after login)
-- Password below is a placeholder hash — generate your own with:
--   php -r "echo password_hash('yourpassword', PASSWORD_DEFAULT), PHP_EOL;"
-- INSERT INTO users (name, email, password_hash, role)
-- VALUES ('Admin', 'admin@codelearning.test', '<paste generated hash here>', 'admin');
