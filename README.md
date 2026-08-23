# Flight Stats - AeroDataBox

En webbapp som hämtar flight-statistik via AeroDataBox API. Mata in ett flight-nummer och få tillbaka statistik över ankomst-gates i tabellformat.

## Funktioner

- SÖ¡k efter flight-nummer (t.ex. LH2415)
- Visa senaste landningarna med gate, terminal, tid och status
- Tabellformat med sortering
- Responsiv design
- Deployad på Cloudflare Workers (serverless)

## 🚀 Komma igÅ¥ng (Cloudflare Workers)

### 1. Skaffa API-nyckel

1. GÅ¥ till [AeroDataBox pÅ¥ RapidAPI](https://rapidapi.com/aerodatabox/api/aerodatabox)
2. Prenumerera pÅ¥ gratis-tier (600 enheter/mÅ¥nad)
3. Kopiera din API-nyckel

### 2. Installera Wrangler

```bash
npm install -g wrangler
```

### 3. Klona repot

```bash
git clone https://github.com/skooghdotcom/flight-stats-aerodatabox.git
cd flight-stats-aerodatabox
```

### 4. Logga in pÅ¥ Cloudflare

```bash
wrangler login
```

### 5. SÃ¤tt API-nyckeln som secret

```bash
wrangler secret put AERODATABOX_API_KEY
# Klistra in din AeroDataBox API-nyckel nÃ¤r du blir tillfrÃ¥gad
```

### 6. Deploya

```bash
wrangler deploy
```

### 7. Ã–ppna appen

Efter deployment fÅ¥r du en URL som:
```
https://flight-stats-aerodatabox.<ditt-subdomain>.workers.dev
```

## � ± Lokal utveckling

### Starta utvecklingsserver

```bash
wrangler dev
```

Appen kÃ¶r nu pÅ¥ `http://localhost:8787`

## � ¡ Projektstruktur

```
flight-stats-aerodatabox/
â»¡â»°â»° README.md
â»£â»°â»° index.html          # Frontend HTML
â»£â»°â»° styles.css          # CSS-styling
â»£â»°â»° app.js              # Frontend JavaScript
â»£â»°â»° worker.js           # Cloudflare Workers backend
â»£â»°â»° wrangler.toml       # Cloudflare Workers config
â»£â»°â»° package.json        # Dependencies
â»£â»°â»° .env.example        # MiljÃ¶variabler (exempel)
â»£â»°â»° .gitignore          # Git ignore
â»£â»°â»° DEPLOYMENT.md       # Alternativ deployment (Node.js, Vercel, etc.)
â»£â»°â»° LICENSE             # MIT License
```

## ðŸ ''Œ API-endpoints

### `GET /api/flight/:flightNumber/history`

HÃ¤mtar historik fÃ¶r ett flight-nummer.

**Parametrar:**
- `flightNumber` (required): Flight-nummer (t.ex. "LH2415")
- `limit` (optional): Antal resultat (default: 10, max: 30)

**Svar:**
```json
{
  "flight": "LH2415",
  "history": [
    {
      "date": "2026-08-09",
      "scheduledArrival": "14:25",
      "actualArrival": "14:18",
      "gate": "K03",
      "terminal": "2",
      "status": "Landed"
    }
  ]
}
```

### `GET /api/health`

Health check endpoint.

**Svar:**
```json
{
  "status": "ok",
  "timestamp": "2026-08-23T08:53:00.000Z",
  "apiConfigured": true
}
```

## ðŸ‡¸ Deployment

### Cloudflare Workers (Default)

```bash
# Installera Wrangler
npm install -g wrangler

# Logga in
wrangler login

# SÃ¤tt API-nyckel
wrangler secret put AERODATABOX_API_KEY

# Deploya
wrangler deploy
```

### Alternativ: Node.js + Express

Se `DEPLOYMENT.md` fÃ¶r alternativ som Node.js, Vercel, Netlify, Railway, etc.

## ðŸ'¸ Kostnader

- **Cloudflare Workers:** Gratis upp till 100,000 requests/dag
- **AeroDataBox:** Gratis 600 API-enheter/mÅ¥nad (rÃ¤cker fÃ¶r ~20 requests/dag)

## ðŸ' Tips

### Gratis API-nycklar med ADS-B

Om du har en ADS-B-mottagare kan du feed:a data till AeroDataBox och fÅ¥ API-credits. LÃ¤s mer pÅ¥ [aerodatabox.com/contribute](https://aerodatabox.com/contribute).

## Licens

MIT
