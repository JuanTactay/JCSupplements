const axios = require('axios');
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const multer = require('multer');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// === SECURITY CONFIG ===
const ADMIN_PASSWORD = "admin"; 
const XENDIT_SECRET_KEY = 'xnd_development_r3Vs0NOnZbo8C7BOdK2FT50rhTzJpK06b9fp1TjyyzXHVUhtRs50z4IRwNg8gT'

// === FILE UPLOAD CONFIG ===
const storage = multer.diskStorage({
  destination: './public/assets/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// === DATABASE CONNECTION ===
let db;
async function initDB() {
  db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });
  console.log('✅ Connected to SQLite database');
}
initDB();

// === MIDDLEWARE ===
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === PROTECTED DASHBOARD ===
app.get('/dashboard', (req, res) => {
  if (req.cookies.admin_token === ADMIN_PASSWORD) {
    res.sendFile(path.join(__dirname, 'private', 'admin.html'));
  } else {
    res.redirect('/login.html');
  }
});

// === STATIC FILES ===
app.use(express.static(path.join(__dirname, 'public')));

// === API ROUTES ===

// --- AUTH ---
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.cookie('admin_token', password, { httpOnly: true });
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Wrong password" });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true });
});

// --- UPLOAD ---
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ success: true, filePath: 'assets/' + req.file.filename });
});

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products');
    res.json(products);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/products', async (req, res) => {
  if (req.headers['x-api-key'] !== ADMIN_PASSWORD) return res.status(403).json({ error: "⛔ Access Denied" });
  try {
    const { name, price, img, description } = req.body;
    const result = await db.run('INSERT INTO products (name, price, img, description) VALUES (?, ?, ?, ?)', [name, price, img, description]);
    res.json({ success: true, id: result.lastID });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/products/:id', async (req, res) => {
  if (req.headers['x-api-key'] !== ADMIN_PASSWORD) return res.status(403).json({ error: "⛔ Access Denied" });
  try {
    const { name, price, img, description } = req.body;
    await db.run('UPDATE products SET name = ?, price = ?, img = ?, description = ? WHERE id = ?', [name, price, img, description, req.params.id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  if (req.headers['x-api-key'] !== ADMIN_PASSWORD) return res.status(403).json({ error: "⛔ Access Denied" });
  try {
    await db.run('DELETE FROM products WHERE id = ?', req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- MESSAGES ---
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const date = new Date().toLocaleString();
    await db.run('INSERT INTO messages (name, email, message, date) VALUES (?, ?, ?, ?)', [name, email, message, date]);
    res.json({ success: true, message: "Message saved!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/messages', async (req, res) => {
  if (req.headers['x-api-key'] !== ADMIN_PASSWORD) return res.status(403).json({ error: "⛔ Access Denied" });
  try {
    const messages = await db.all('SELECT * FROM messages ORDER BY id DESC');
    res.json(messages);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// NEW: Delete Message Route
app.delete('/api/messages/:id', async (req, res) => {
  if (req.headers['x-api-key'] !== ADMIN_PASSWORD) return res.status(403).json({ error: "⛔ Access Denied" });
  try {
    await db.run('DELETE FROM messages WHERE id = ?', req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 4. ORDERS (Modified for Xendit)
app.post('/api/orders', async (req, res) => {
  try {
    const { customer_name, contact_number, address, city, total, items } = req.body;
    const date = new Date().toLocaleString();
    const itemsString = JSON.stringify(items);
    
    // 1. Save Order to Database first (Status: Pending)
    await db.run(
      'INSERT INTO orders (customer_name, contact_number, address, city, total, items, status, payment_status, last_updated, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [customer_name, contact_number, address, city, total, itemsString, 'Pending', 'Unpaid', date, date]
    );
    
    // Get the Order ID
    const result = await db.get('SELECT last_insert_rowid() as id');
    const orderId = result.id;

    // 2. Create Xendit Invoice
    // We send a request to Xendit's servers
    const xenditResponse = await axios({
        method: 'POST',
        url: 'https://api.xendit.co/v2/invoices',
        headers: {
            'Content-Type': 'application/json',
            // Basic Auth requires the key to be encoded
            'Authorization': 'Basic ' + Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')
        },
        data: {
            external_id: `ORDER-${orderId}`, // Unique Ref ID
            amount: total,
            payer_email: "customer@example.com", // You could ask for this in the form too
            description: `JCSupplements Order #${orderId}`,
            success_redirect_url: `https://jcsupplements.onrender.com/success.html?id=${orderId}`, // Where to go after payment
            failure_redirect_url: `https://jcsupplements.onrender.com/shop.html`
        }
    });

    // 3. Send the Xendit URL back to the frontend
    res.json({ 
        success: true, 
        orderId: orderId, 
        paymentUrl: xenditResponse.data.invoice_url 
    });

  } catch (error) { 
      console.error(error.response ? error.response.data : error.message);
      res.status(500).json({ error: "Payment creation failed" }); 
  }
});
// NEW: Update Order Status Route
app.put('/api/orders/:id', async (req, res) => {
  if (req.headers['x-api-key'] !== ADMIN_PASSWORD) return res.status(403).json({ error: "⛔ Access Denied" });
  try {
    const { status } = req.body;
    const date = new Date().toLocaleString();
    await db.run('UPDATE orders SET status = ?, last_updated = ? WHERE id = ?', [status, date, req.params.id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// DELETE: Remove an order (SECURED)
app.delete('/api/orders/:id', async (req, res) => {
  if (req.headers['x-api-key'] !== ADMIN_PASSWORD) return res.status(403).json({ error: "⛔ Access Denied" });
  try {
    await db.run('DELETE FROM orders WHERE id = ?', req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// NEW: Public Tracking Route
app.get('/api/orders/:id/track', async (req, res) => {
  try {
    const order = await db.get('SELECT id, status, last_updated, items, total FROM orders WHERE id = ?', req.params.id);
    if (order) res.json(order);
    else res.status(404).json({ message: "Order not found" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// === START SERVER ===
app.listen(PORT, () => {
    console.log(`✅ Server is running locally at http://localhost:${PORT}`);
});