const db = require('./db_connection'); 
const express = require('express');
const app = express();
const port = 3000;
const jwt = require('jsonwebtoken');
const SECRET_KEY = "supersecret123";

app.use(express.json());



function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Access denied, token missing" });

  jwt.verify(token, SECRET_KEY, async (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });

    const [rows] = await db.query("SELECT * FROM revoked_tokens WHERE token = ?", [token]);
    if (rows.length > 0) {
      return res.status(401).json({ error: "Token has been revoked" });
    }
    req.user = user;
    next();
  });
}




app.get('/', (req, res) => {
  res.send('Express server is running!');
});




app.get('/roles', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Role");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




app.post('/create_users', async (req, res) => {
  try {
    const { name, email, password, role_id } = req.body;
    if (!name || !email || !password || !role_id) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const [result] = await db.query(
      "INSERT INTO User (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)",
      [name, email, password, role_id]
    );
    res.status(201).json({
      message: " User created successfully",
      user_id: result.insertId
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.get('/allusers',authenticateToken,async(req,res)=>{
    try {
    const [Users] = await db.query("SELECT name FROM `User`");
    res.json(Users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.post('/login', async (req, res) => {
  try {
    const { email, pass } = req.body;
    if (!email || !pass) {
      return res.status(400).json({ error: "Email and password are required" });}
    const [rows] = await db.query("SELECT * FROM `User` WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });}
  const user = rows[0];
   const isMatch = pass === user.password_hash;
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: user.user_id, role: user.role_id, email: user.email },
      SECRET_KEY, 
      { expiresIn: "1h" } 
    );
    res.json({
      message: "Login successful",
      token
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.post('/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    const expiresAt = new Date(req.user.exp * 1000); 
    await db.query("INSERT INTO revoked_tokens (token, expires_at) VALUES (?, ?)", [token, expiresAt]);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
