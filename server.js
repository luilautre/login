// Dépendances principales
const express = require('express');
const session = require('express-session');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialisation de l'application
const app = express();

// Sécurité basique : limite le nombre de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // 100 requêtes par IP
});
app.use(limiter);

// Middleware pour analyser les formulaires et le JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Gestion des sessions utilisateur
app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000 // 1h
  }
}));

// Dossier public pour les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Authentification simple via variables d’environnement
const USERNAME = process.env.AUTH_USERNAME || 'admin';
const PASSWORD = process.env.AUTH_PASSWORD || 'password';

// Middleware d’authentification
function requireLogin(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login.html');
  }
}

// Route POST pour le login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    req.session.loggedIn = true;
    res.redirect('/dashboard.html');
  } else {
    res.status(401).send('Nom d’utilisateur ou mot de passe invalide.');
  }
});

// Route GET pour la déconnexion
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// Exemple de route protégée
app.get('/dashboard', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Page d’accueil (redirige vers login)
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
