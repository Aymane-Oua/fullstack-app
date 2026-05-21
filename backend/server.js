// server.js
require("dotenv").config(); // [cite: 55]
const express = require("express"); // [cite: 73]
const path = require("path"); // [cite: 74]
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000; // [cite: 57, 58]

// Route de test API demandée dans le TP
app.get("/api/users", (req, res) => { // 
    res.json([{ id: 1, name: "Aymane" }]);
});

// 1. Servir les fichiers statiques React [cite: 71]
app.use(express.static(path.join(__dirname, "../frontend/build"))); // [cite: 75]

// 2. Redirection des routes React (pour éviter les erreurs 404 lors de la navigation) [cite: 76]
app.get(/(.*)/, (req, res) => { // [cite: 78]
    res.sendFile(path.join(__dirname, "../frontend/build/index.html")); // [cite: 79, 80]
}); // [cite: 82]
// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});