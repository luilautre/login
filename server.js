const express = require('express');
app.use(limiter);


app.use(session({
secret: SESSION_SECRET,
resave: false,
saveUninitialized: false,
cookie: {
httpOnly: true,
secure: process.env.NODE_ENV === 'production',
sameSite: 'lax',
maxAge: 1000 * 60 * 60,
},
}));


app.use(express.static(path.join(__dirname, 'public')));


app.post('/login', async (req, res) => {
const { username, password } = req.body || {};
if (!username || !password) {
return res.status(400).json({ success: false, message: 'Champs manquants' });
}


if (username !== AUTH_USERNAME) {
return res.status(401).json({ success: false, message: 'Nom d\'utilisateur incorrect' });
}


if (!HASHED_PASSWORD) {
return res.status(500).json({ success: false, message: 'HASHED_PASSWORD non défini côté serveur' });
}


try {
const match = await bcrypt.compare(password, HASHED_PASSWORD);
if (!match) return res.status(401).json({ success: false, message: 'Mot de passe incorrect' });


req.session.authenticated = true;
req.session.user = { username };
return res.json({ success: true, message: 'Connexion réussie' });
} catch (err) {
console.error(err);
return res.status(500).json({ success: false, message: 'Erreur interne' });
}
});


app.get('/session', (req, res) => {
if (req.session && req.session.authenticated) {
return res.json({ authenticated: true, user: req.session.user });
}
return res.json({ authenticated: false });
});


app.post('/logout', (req, res) => {
req.session.destroy(err => {
if (err) return res.status(500).json({ success: false });
res.clearCookie('connect.sid');
return res.json({ success: true });
});
});


app.get('/protected', (req, res) => {
if (req.session && req.session.authenticated) {
return res.json({ success: true, secret: 'Voici une info protégée' });
}
return res.status(401).json({ success: false, message: 'Non autorisé' });
});


app.get('*', (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, () => console.log(`Server started on port ${PORT}`));