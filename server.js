const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

// Database Connection
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
  : new Pool({
      user: "postgres",
      host: "localhost",
      database: "mental_tracker",
      password: "ashmi",
      port: 5432
    });

// Create Tables
async function createTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(100)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS moods(
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        mood VARCHAR(50),
        mood_score INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS journals(
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS productivity(
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        tasks_completed INT,
        study_hours DECIMAL(4,1),
        score INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Tables created successfully");
  } catch (err) {
    console.error("Table creation error:", err);
  }
}

createTables();

// Register
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    await pool.query(
      "INSERT INTO users(name,email,password) VALUES($1,$2,$3)",
      [name, email, password]
    );

    res.json({ message: "Registered Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration Failed" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND password=$2",
      [email, password]
    );

    if (user.rows.length > 0) {
      res.json(user.rows[0]);
    } else {
      res.status(401).json({
        message: "Invalid Email or Password"
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login Failed" });
  }
});

// Save Mood
app.post("/mood", async (req, res) => {
  try {
    const { user_id, mood, mood_score } = req.body;

    await pool.query(
      "INSERT INTO moods(user_id,mood,mood_score) VALUES($1,$2,$3)",
      [user_id, mood, mood_score]
    );

    res.json({ message: "Mood Saved Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Mood Save Failed" });
  }
});

// Save Journal
app.post("/journal", async (req, res) => {
  try {
    const { user_id, content } = req.body;

    await pool.query(
      "INSERT INTO journals(user_id,content) VALUES($1,$2)",
      [user_id, content]
    );

    res.json({ message: "Journal Saved Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Journal Save Failed" });
  }
});

// Save Productivity
app.post("/productivity", async (req, res) => {
  try {
    const {
      user_id,
      tasks_completed,
      study_hours,
      score
    } = req.body;

    await pool.query(
      `INSERT INTO productivity
      (user_id,tasks_completed,study_hours,score)
      VALUES($1,$2,$3,$4)`,
      [user_id, tasks_completed, study_hours, score]
    );

    res.json({
      message: "Productivity Saved Successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Productivity Save Failed"
    });
  }
});

// Analytics
app.get("/analytics/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const mood = await pool.query(
      "SELECT AVG(mood_score) AS avg_mood FROM moods WHERE user_id=$1",
      [userId]
    );

    const journals = await pool.query(
      "SELECT COUNT(*) AS total_journals FROM journals WHERE user_id=$1",
      [userId]
    );

    const productivity = await pool.query(
      "SELECT AVG(score) AS avg_score FROM productivity WHERE user_id=$1",
      [userId]
    );

    res.json({
      avgMood: mood.rows[0].avg_mood || 0,
      totalJournals: journals.rows[0].total_journals || 0,
      productivityScore: productivity.rows[0].avg_score || 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Analytics Failed"
    });
  }
});

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Mental Wellness Tracker Backend is Running");
});

app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});