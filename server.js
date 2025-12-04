const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const PORT = 3000;

// === DATABASE CONNECTION ===
let db;

// Open the database connection when server starts
async function initDB() {
  db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });
  console.log('✅ Connected to SQLite database');
}

// Initialize DB immediately
initDB();

// === MIDDLEWARE ===
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === API ROUTES ===

// GET: Fetch all products from Database
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Fetch a SINGLE product by ID from Database
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // The '?' is a security feature (prevents SQL Injection)
    const product = await db.get('SELECT * FROM products WHERE id = ?', id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Add a NEW product to the Database
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, img, description } = req.body;

    // Validation: Ensure all fields are provided
    if (!name || !price || !img || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Insert into SQLite
    const result = await db.run(
      'INSERT INTO products (name, price, img, description) VALUES (?, ?, ?, ?)',
      [name, price, img, description]
    );

    // Send back the ID of the new row
    res.json({ 
      success: true, 
      id: result.lastID, 
      message: "Product added successfully!" 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Handle Contact Form Submission
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log(`📩 Contact: ${name} (${email}) says: ${message}`);
  res.json({ success: true, message: "Message received!" });
});

// === FRONTEND ROUTES ===
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === START SERVER ===
app.listen(PORT, () => {
    console.log(`✅ Server is running locally at http://localhost:${PORT}`);
});