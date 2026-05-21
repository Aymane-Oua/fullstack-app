// server.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JSON_FILE_PATH = path.join(__dirname, "proposals.json");

// --- CONFIGURATION BASE DE DONNÉES (MONGODB & FALLBACK LOCAL JSON) ---
let useMongoDB = false;
let ProposalModel = null;

const MONGO_URI = process.env.MONGO_URI;

const proposalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  projectType: { type: String, required: true },
  budget: { type: String, required: true },
  message: { type: String, required: true },
  newsletter: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

if (MONGO_URI && MONGO_URI !== "xxxxxXXX" && !MONGO_URI.includes("placeholder")) {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log("🚀 Connecté avec succès à MongoDB !");
      useMongoDB = true;
      ProposalModel = mongoose.model("Proposal", proposalSchema);
    })
    .catch((err) => {
      console.error("⚠️ Échec de connexion à MongoDB :", err.message);
      console.log("📁 Utilisation du stockage de secours JSON local (proposals.json).");
    });
} else {
  console.log("ℹ️ MONGO_URI non configurée. Stockage de secours local actif (proposals.json).");
}

// Helper pour sauvegarder une proposition (Mongo ou JSON)
async function saveProposal(data) {
  if (useMongoDB && ProposalModel) {
    const newProposal = new ProposalModel(data);
    return await newProposal.save();
  } else {
    let proposals = [];
    if (fs.existsSync(JSON_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(JSON_FILE_PATH, "utf8");
        proposals = JSON.parse(raw);
      } catch (err) {
        console.error("Erreur de lecture du fichier JSON local :", err.message);
      }
    }
    
    const newProposal = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    };
    
    proposals.push(newProposal);
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(proposals, null, 2), "utf8");
    return newProposal;
  }
}

// Helper pour lire toutes les propositions
async function getProposals() {
  if (useMongoDB && ProposalModel) {
    return await ProposalModel.find().sort({ createdAt: -1 });
  } else {
    if (fs.existsSync(JSON_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(JSON_FILE_PATH, "utf8");
        const list = JSON.parse(raw);
        // Trier par date décroissante (plus récent en premier)
        return [...list].reverse();
      } catch (err) {
        console.error("Erreur de lecture du fichier JSON local :", err.message);
        return [];
      }
    }
    return [];
  }
}

// --- ROUTES DE L'API ---

// Route de test des utilisateurs
app.get("/api/users", (req, res) => {
    res.json([{ id: 1, name: "Aymane" }]);
});

// Route POST pour créer une proposition
app.post("/api/proposals", async (req, res) => {
  try {
    const { name, email, projectType, budget, message, newsletter } = req.body;
    
    // Validation basique côté serveur
    if (!name || !email || !projectType || !budget || !message) {
      return res.status(400).json({ error: "Tous les champs obligatoires doivent être remplis." });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "L'adresse email fournie est invalide." });
    }
    
    const dataToSave = { name, email, projectType, budget, message, newsletter: !!newsletter };
    const savedProposal = await saveProposal(dataToSave);
    
    res.status(201).json({
      success: true,
      message: "Votre proposition a été enregistrée avec succès !",
      data: savedProposal
    });
  } catch (error) {
    console.error("Erreur serveur lors de la soumission :", error);
    res.status(500).json({ error: "Une erreur interne est survenue sur le serveur." });
  }
});

// Route GET pour récupérer les propositions
app.get("/api/proposals", async (req, res) => {
  try {
    const proposals = await getProposals();
    res.json(proposals);
  } catch (error) {
    console.error("Erreur de récupération des propositions :", error);
    res.status(500).json({ error: "Impossible de récupérer les propositions." });
  }
});

// --- SERVIR LE FRONTEND EN PRODUCTION ---
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Redirection globale vers l'index React pour le routage côté client
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});