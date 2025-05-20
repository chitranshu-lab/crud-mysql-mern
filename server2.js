const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve images

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",  
  database: "mern",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL");
});

// Create User
app.post("/users", upload.single("image"), async (req, res) => {
  const { name, email, password } = req.body;
  const file = req.file;

  if (!name || !email || !password || !file) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO  imageusers (name, email, password, image) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, email, hashedPassword, file.filename], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ id: result.insertId, name, email, image: file.filename });
  });
});

// Get Users
app.get("/users", (req, res) => {
  db.query("SELECT id, name, email, image FROM  imageusers", (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

  

app.put("/users/:id", upload.single("image"), (req, res) => {
  const { name, email, password } = req.body;
  const id = req.params.id;

  console.log("Received PUT request:", { id, name, email, password });
  console.log("File info:", req.file);

  let sql;
  let values;

  if (req.file) {
    const image = req.file.filename;
    sql = "UPDATE  imageusers SET name = ?, email = ?, password = ?, image = ? WHERE id = ?";
    values = [name, email, password, image, id];
  } else {
    sql = "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?";
    values = [name, email, password, id];
  }

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("MySQL error:", err);
      return res.status(500).send(err);
    }
    res.send({ id, name, email });
  });
});

// Delete User
app.delete("/users/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT image FROM  imageusers WHERE id = ?", [id], (err, results) => {
    if (err || results.length === 0) return res.status(500).send("User not found.");

    const imageFile = results[0].image;

    fs.unlink(path.join("uploads", imageFile), (err) => {
      if (err) console.warn("Image deletion failed");

      db.query("DELETE FROM imageusers WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ success: true });
      });
    });
  });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
