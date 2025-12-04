const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// === MIDDLEWARE ===
// 1. Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// 2. Parse incoming data (Allow server to read JSON sent by frontend)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === DATABASE (Simulated) ===
const products = [
  {
    id: 1,
    name: "Feral Pre-Workout",
    price: 39.99,
    img: "assets/preworkout.webp",
  },
  { id: 2, name: "Beast Protein", price: 49.99, img: "assets/protein.webp" },
  { id: 3, name: "Alpha Recovery", price: 29.99, img: "assets/bcaa.webp" },
];

// === API ROUTES ===

// GET: Fetch all products
app.get("/api/products", (req, res) => {
  res.json(products);
});

// POST: Handle Contact Form Submission
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  // Simulate sending an email by logging to the terminal
  console.log("--------------------------------");
  console.log("📩 NEW CONTACT MESSAGE RECEIVED");
  console.log(`👤 Name: ${name}`);
  console.log(`📧 Email: ${email}`);
  console.log(`📝 Message: ${message}`);
  console.log("--------------------------------");

  // Send a success response back to the browser
  res.json({ success: true, message: "Message received!" });
});

// === FRONTEND ROUTES ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`✅ Server is running locally at http://localhost:${PORT}`);
});
