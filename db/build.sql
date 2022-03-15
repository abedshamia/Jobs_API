BEGIN;

DROP TYPE IF EXISTS "status" CASCADE;
DROP TABLE IF EXISTS users, jobs CASCADE;

CREATE TYPE status AS ENUM ('interview', 'declined', 'pending');
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  company VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  status status NOT NULL DEFAULT 'pending',
  createdBy INTEGER NOT NULL,
  FOREIGN KEY (createdBy) REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()

);


COMMIT;