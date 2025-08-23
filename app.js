const db = require('./db_connection'); 
const express = require('express');
const app = express();
const port = 3000;
const jwt = require('jsonwebtoken');
const SECRET_KEY = "supersecret123";



// middleware to deal with json format
app.use(express.json());


// Authorization ftnto verify the jwt token before providing access
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



// default route
app.get('/', (req, res) => {
  res.send('Express server is running!');
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

// Route to get all the roles .i.e Drivers ,Mechanics
app.get('/roles',authenticateToken, async (req, res) => {
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
    const [Users] = await db.query("SELECT * FROM `User`");
    res.json(Users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role_id, status } = req.body;

    if (!name && !email && !role_id && !status) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const [result] = await db.query(
      "UPDATE `User` SET name = ?, email = ?, role_id = ?, status = ? WHERE user_id = ?",
      [name, email, role_id, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: " User updated successfully" });

  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.delete('/users/:id',authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM `User` WHERE user_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: " User deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get('/allvehicles',authenticateToken,async(req,res)=>{
  try {
    const [Vehicles] = await db.query("SELECT * FROM `Vehicle`");
    res.json(Vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/create_vehicle', authenticateToken, async (req, res) => {
  try {
    const { plate_number, model, year, status, assigned_driver_id } = req.body;

    // Required fields
    if (!plate_number || !model || !year) {
      return res.status(400).json({ error: "plate_number, model, and year are required" });
    }

    // Insert query
    const [result] = await db.query(
      "INSERT INTO Vehicle (plate_number, model, year, status, assigned_driver_id) VALUES (?, ?, ?, ?, ?)",
      [plate_number, model, year, status || 'active', assigned_driver_id || null]
    );

    res.status(201).json({
      message: "🚗 Vehicle created successfully",
      vehicle_id: result.insertId
    });
  } catch (err) {
    console.error("Error creating vehicle:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put('/vehicles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { plate_number, model, year, status, assigned_driver_id } = req.body; 
    if (!plate_number && !model && !year && !status && !assigned_driver_id ) {
      return res.status(400).json({ error: "NO feild is updated" });
    }
    const [result] = await db.query(
      "UPDATE `Vehicle` SET plate_number=? ,model=? ,year=?,status=?,assigned_driver_id=? Where Vehicle_id=?" ,
      [plate_number,model,year, status,assigned_driver_id, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    res.json({ message: " Vehicle updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.delete('/vehicles/:id',authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM `Vehicle` WHERE vehicle_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res.json({ message: " Vehicle deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
