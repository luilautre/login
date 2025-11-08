1. Construire localement (test) :
- `docker build -t login-jx55 .`
- `docker run -e AUTH_USERNAME=admin -e AUTH_PASSWORD=pass -e SESSION_SECRET=secret -p 3000:3000 login-jx55`


2. Sur Render :
- Créez un nouveau service Docker (Web Service).
- Pointez sur votre repo Git (ou téléversez).
- Dans les Environment Variables, définissez `AUTH_USERNAME`, `AUTH_PASSWORD`, `SESSION_SECRET`.
- Déployez.


3. Notes de sécurité :
- Ici le mot de passe est comparé en clair avec la variable d'environnement. Pour production, stockez un hash ou utilisez un provider (Auth0, etc.).
- Assurez-vous que `SESSION_SECRET` soit long et aléatoire.
- Activez HTTPS (Render le fournit par défaut) et `secure` cookie (activé automatiquement si `NODE_ENV=production`).
