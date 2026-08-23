# Flight Stats - AeroDataBox

En webbapp som hämtar flight-statistik via AeroDataBox API. Mata in ett flight-nummer och få tillbaka statistik över ankomst-gates i tabellformat.

## Funktioner

- SÖ¡k efter flight-nummer (t.ex. LH2415)
- Visa senaste landningarna med gate, terminal, tid och status
- Tabellformat med sortering
- Responsiv design

## Komma igÃ¥ng

### 1. Skaffa API-nyckel

1. GÃ¥ till [AeroDataBox pÃ¥ RapidAPI](https://rapidapi.com/aerodatabox/api/aerodatabox)
2. Prenumerera pÃ¥ gratis-tier (600 enheter/mÃ¥nad)
3. Kopiera din API-nyckel

### 2. Konfigurera backend

```bash
# Installera dependencies
npm install

# Kopiera .env.example till .env
cp .env.example .env

# Redigera .env och lÃ¤gg till din API-nyckel
AERODATABOX_API_KEY=din_api_nyckel_hÃ¤r
```

### 3. Starta utvecklingsserver

```bash
npm run dev
```

### 4. Ã–ppna appen

GÃ¥ till `http://localhost:3000` i din webblÃ¤sare.

## Projektstruktur

```
flight-stats-aerodatabox/
â»¡â»°â»° README.md
â»£â»°â»° index.html          # Frontend HTML
â»£â»°â»° styles.css          # CSS-styling
â»£â»°â»° app.js              # Frontend JavaScript
â»£â»°â»° api.js              # Backend API (Node.js/Cloudflare Workers)
â»£â»°â»° package.json        # Node.js dependencies
â»£â»°â»° .env.example        # MiljÃ¶variabler (exempel)
â»£â»°â»° .gitignore          # Git ignore
â»£â»°â»° wrangler.toml       # Cloudflare Workers config (valfritt)
â»£â»°â»° worker.js           # Cloudflare Workers entry (valfritt)
â»£â»°â»° server.js           # Node.js backend (valfritt)
```

## API-endpoints

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

## Deployment

### Cloudflare Workers

```bash
# Installera Wrangler
npm install -g wrangler

# Logga in
wrangler login

# Deploya
wrangler deploy
```

### Vercel

```bash
# Installera Vercel CLI
npm install -g vercel

# Deploya
vercel
```

### Netlify

```bash
# Installera Netlify CLI
npm install -g netlify-cli

# Deploya
netlify deploy --prod
```

## Licens

MIT
