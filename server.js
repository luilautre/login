// Dépendances principales
const express = require("express");
const session = require("express-session");
const path = require("path");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Initialisation de l'application
const app = express();

// Sécurité basique : limite le nombre de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
});
app.use(limiter);

// Middleware pour analyser les formulaires et le JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Gestion des sessions utilisateur
app.use(
  session({
    secret: process.env.SESSION_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1h
    },
  })
);

// Dossier public pour les fichiers statiques
app.use(express.static(path.join(__dirname, "public")));

// === Base de données en mémoire (à remplacer plus tard par SQLite/Postgres)
const users = [];

// Middleware d’authentification
function requireLogin(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/");
  }
}

// Route POST pour créer un compte
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (users.find((u) => u.username === username)) {
    return res.status(400).send("Nom d'utilisateur déjà pris.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  console.log(`✅ Nouvel utilisateur : ${username}`);
  res.redirect("/");
});

// Route POST pour le login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(401).send("Nom d’utilisateur ou mot de passe invalide.");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).send("Nom d’utilisateur ou mot de passe invalide.");
  }

  req.session.loggedIn = true;
  req.session.username = username;
  console.log(`🔓 Connexion : ${username}`);
  res.redirect("/dashboard");
});

// Route GET pour la déconnexion
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

// Route protégée : tableau de bord
app.get("/dashboard", requireLogin, (req, res) => {
  res.send(`
    <h1>Bienvenue ${req.session.username} !</h1>
    <a href="/logout">Se déconnecter</a>
  `);
});

// Page d’accueil (redirige vers login)
app.get("/", (req, res) => {
  res.redirect("/");
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
