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
    description: "Explosive energy and focus. Feral Pre-Workout is designed to help you crush your limits with 300mg of caffeine and beta-alanine for endurance." 
  },
  { 
    id: 2, 
    name: "Beast Protein", 
    price: 49.99, 
    img: "assets/protein.webp",
    description: "Build lean muscle fast. Beast Protein delivers 24g of pure whey isolate per scoop, with zero fillers and digestive enzymes for quick absorption." 
  },
  { 
    id: 3, 
    name: "Alpha Recovery", 
    price: 29.99, 
    img: "assets/bcaa.webp",
    description: "Recover faster, train harder. Alpha Recovery loads your system with essential BCAAs and electrolytes to reduce soreness and hydration fatigue." 
  }
];

// === API ROUTES ===

// GET: Fetch all products
app.get("/api/products", (req, res) => {
  res.json(products);
});

// GET: Fetch a SINGLE product by ID
app.get("/api/products/:id", (req, res) => {
  const productId = parseInt(req.params.id); // Get ID from URL (e.g., 1)
  const product = products.find((p) => p.id === productId);

  if (product) {
    res.json(product); // Send the product data
  } else {
    res.status(404).json({ message: "Product not found" }); // Send error
  }
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
