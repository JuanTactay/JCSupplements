const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// === DATABASE (Simulated) ===
// Ideally, this data comes from a real database (MySQL/MongoDB).
// For now, we store it in a variable on the server.
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

// === MIDDLEWARE ===
// Serve static files (HTML, CSS, JS, Images) from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// === API ROUTES ===
// This is your first API Endpoint!
// When the frontend asks for '/api/products', we send the data.
app.get("/api/products", (req, res) => {
  res.json(products);
});

// === FRONTEND ROUTES ===
// Handle the default route (Home Page)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`✅ Server is running locally at http://localhost:${PORT}`);
});
