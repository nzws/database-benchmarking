DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;

-- schema

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  content TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);

-- test data

INSERT INTO users (username, email)
SELECT
  'user' || i,
  'user' || i || '@example.com'
FROM generate_series(1, 1000) AS i;

INSERT INTO posts (user_id, title, content, view_count)
SELECT
  (random() * 999 + 1)::INTEGER,
  'Post title ' || i,
  'This is the content of post ' || i || '. ' || repeat('Lorem ipsum dolor sit amet. ', 10),
  (random() * 10000)::INTEGER
FROM generate_series(1, 7500) AS i;

ANALYZE users;
ANALYZE posts;
