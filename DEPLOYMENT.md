# Deployments-guide

## Alternativ 1: Node.js + Express (Lokalt eller VPS)

### Lokalt

```bash
# 1. Klona repot
git clone https://github.com/skooghdotcom/flight-stats-aerodatabox.git
cd flight-stats-aerodatabox

# 2. Installera dependencies
npm install

# 3. Kopiera .env.example till .env
cp .env.example .env

# 4. Redigera .env och lÃ¤gg till din AeroDataBox API-nyckel
nano .env  # eller anvÃ¤nd din favorit-editor

# 5. Starta servern
npm start

# 6. Ã–ppna http://localhost:3000
```

### VPS (t.ex. DigitalOcean, Hetzner)

```bash
# 1. Installera Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Klona repot
git clone https://github.com/skooghdotcom/flight-stats-aerodatabox.git
cd flight-stats-aerodatabox

# 3. Installera dependencies
npm install --production

# 4. SÃ¤tt miljÃ¶variabler
export AERODATABOX_API_KEY="din_nyckel"
export PORT=3000

# 5. Starta med PM2 (process manager)
sudo npm install -g pm2
pm2 start server.js --name flight-stats
pm2 save
pm2 startup

# 6. SÃ¤tt upp nginx som reverse proxy (valfritt)
sudo apt-get install -y nginx
# Konfigurera /etc/nginx/sites-available/flight-stats
```

## Alternativ 2: Cloudflare Workers

### FÃ¶rberedelser

```bash
# 1. Installera Wrangler CLI
npm install -g wrangler

# 2. Logga in pÃ¥ Cloudflare
wrangler login

# 3. Klona repot
git clone https://github.com/skooghdotcom/flight-stats-aerodatabox.git
cd flight-stats-aerodatabox
```

### Deploya

```bash
# 1. SÃ¤tt API-nyckeln som secret
wrangler secret put AERODATABOX_API_KEY
# (Klistra in din AeroDataBox API-nyckel nÃ¤r du blir tillfrÃ¥gad)

# 2. Deploya
wrangler deploy

# 3. Appen Ãr nu tillgÃ¤nglig pÃ¥:
# https://flight-stats-aerodatabox.<ditt-subdomain>.workers.dev
```

### Uppdatera

```bash
# Efter Ãndringar i worker.js:
wrangler deploy
```

### Statiska filer (index.html, etc.)

FÃ¶r att serve:a statiska filer frÃ¥n Workers, anvÃ¤nd **Workers Sites**:

```bash
# 1. Uppdatera wrangler.toml:
# [site]
# bucket = "./public"

# 2. Flytta statiska filer till public/ mapp
mkdir public
mv index.html styles.css app.js public/

# 3. Deploya igen
wrangler deploy
```

## Alternativ 3: Vercel

```bash
# 1. Installera Vercel CLI
npm install -g vercel

# 2. Logga in
vercel login

# 3. Deploya
vercel

# 4. SÃ¤tt miljÃ¶variabler i Vercel dashboard
# GÃ¥ till Project Settings > Environment Variables
# LÃ¤gg till: AERODATABOX_API_KEY
```

## Alternativ 4: Netlify

```bash
# 1. Installera Netlify CLI
npm install -g netlify-cli

# 2. Logga in
netlify login

# 3. Initiera projekt
netlify init

# 4. Deploya
netlify deploy --prod

# 5. SÃ¤tt miljÃ¶variabler i Netlify dashboard
# Site settings > Build & deploy > Environment
```

## Alternativ 5: Railway

```bash
# 1. Installera Railway CLI
npm install -g @railway/cli

# 2. Logga in
railway login

# 3. Initiera projekt
railway init

# 4. LÃ¤gg till miljÃ¶variabler
railway variables set AERODATABOX_API_KEY=din_nyckel

# 5. Deploya
railway up
```

## Alternativ 6: Render

1. GÃ¥ till [render.com](https://render.com)
2. Skapa nytt "Web Service"
3. Koppla ditt GitHub-repo
4. Build Command: `npm install`
5. Start Command: `npm start`
6. LÃ¤gg till miljÃ¶variabel: `AERODATABOX_API_KEY`
7. Deploya!

## Testa API:et

NÃ¤r servern kÃ¶r, testa API:et:

```bash
# Health check
curl http://localhost:3000/api/health

# HÃ¤mta flight-historik
curl http://localhost:3000/api/flight/LH2415/history?limit=10
```

## FelsÃ¶kning

### "API-nyckel inte konfigurerad"

Kontrollera att `.env`-filen finns och innehÃ¥ller:
```
AERODATABOX_API_KEY=din_faktiska_nyckel
```

### "Ogiltig API-nyckel"

1. Kontrollera att nyckeln Ãr korrekt kopierad frÃ¥n RapidAPI
2. Kontrollera att du har en aktiv prenumeration pÃ¥ AeroDataBox API
3. Kontrollera att du inte har nÃ¥tt din mÃ¥nadsgrÃ¤ns

### "Ingen data hittades"

Vissa flight-nummer kanske inte har historik i AeroDataBox. Testa med ett vanligt flight-nummer som LH2415.

## NÃ¤sta steg

- [ ] LÃ¤gg till caching (Redis eller Cloudflare KV)
- [ ] Implementera rate limiting
- [ ] LÃ¤gg till fler API:er (SkyLink, AviationStack)
- [ ] Bygg en React/Vue/Svelte frontend
- [ ] LÃ¤gg till autentisering
- [ ] Spara sökningar i databas
- [ ] Exportera data till CSV/Excel
