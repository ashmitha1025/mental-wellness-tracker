CREATE TABLE moods(
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    mood VARCHAR(20),
    mood_score INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255)
);

CREATE TABLE journals(
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    title VARCHAR(200),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productivity(
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    tasks_completed INT,
    study_hours DECIMAL,
    score INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);