const express = require("express");
const cors = require("cors");


const { Pool } = require("pg");

const pool = new Pool({
    user:"postgres",
    host:"localhost",
    database:"mental_tracker",
    password:"ashmi",
    port:5432
});

module.exports = pool;

const app = express();

app.use(cors());
app.use(express.json());

app.post("/register",async(req,res)=>{

    const {name,email,password}=req.body;

    await pool.query(
        "INSERT INTO users(name,email,password) VALUES($1,$2,$3)",
        [name,email,password]
    );

    res.json({message:"Registered"});
});

app.post("/login",async(req,res)=>{

    const {email,password}=req.body;

    const user=await pool.query(
        "SELECT * FROM users WHERE email=$1 AND password=$2",
        [email,password]
    );

    if(user.rows.length>0)
        res.json(user.rows[0]);
    else
        res.status(401).json({message:"Invalid"});
});

app.post("/mood",async(req,res)=>{

    const {user_id,mood,mood_score}=req.body;

    await pool.query(
        "INSERT INTO moods(user_id,mood,mood_score) VALUES($1,$2,$3)",
        [user_id,mood,mood_score]
    );

    res.json({message:"Mood Saved"});
});

app.post("/journal",async(req,res)=>{

    const {user_id,content}=req.body;

    await pool.query(
        "INSERT INTO journals(user_id,content) VALUES($1,$2)",
        [user_id,content]
    );

    res.json({message:"Journal Saved"});
});

app.get("/analytics/:id",async(req,res)=>{

    const mood=await pool.query(
        "SELECT AVG(mood_score) FROM moods WHERE user_id=$1",
        [req.params.id]
    );

    const journals=await pool.query(
        "SELECT COUNT(*) FROM journals WHERE user_id=$1",
        [req.params.id]
    );

    res.json({
        avgMood:mood.rows[0].avg,
        totalJournals:journals.rows[0].count
    });
});

app.listen(5000,()=>{
    console.log("Server Running");
});