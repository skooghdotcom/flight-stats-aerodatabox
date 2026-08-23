# Flight Stats - AeroDataBox

En webbapp som hämtar flight-statistik via AeroDataBox API. Mata in ett flight-nummer och få tillbaka statistik över ankomst-gates i tabellformat.

## Funktioner

- SÖ¡k efter flight-nummer (t.ex. LH2415)
- Visa senaste landningarna med gate, terminal, tid och status
- Tabellformat med sortering
- Responsiv design
- Deployad på Cloudflare Workers (serverless)
- Optimerad med cache headers och minifiering
- API-nyckelvalidering

## 🚀 Komma igÅ¥ng (Cloudflare Workers)

### 1. Skaffa API-nyckel

1. GÅ¥ till [AeroDataBox pÅ¥ RapidAPI](https://rapidapi.com/aerodatabox/api/aerodatabox)
2. Prenumerera pÅ¥ gratis-tier (600 enheter/mÅ¥nad)
3. Kopiera din API-nyckel (må·¨ste vara ≥32 tecken)

### 2. Installera Wrangler

```bash
npm install -g wrangler
```

### 3. Klona repot

```bash
git clone https://github.com/skooghdotcom/flight-stats-aerodatabox.git
cd flight-stats-aerodatabox
```

### 4. Installera dependencies

```bash
# Med npm
npm install

# Eller med bun (snabbare)
bun install
```

### 5. Logga in pÅ¥ Cloudflare

```bash
wrangler login
```

### 6. SÃ¤tt API-nyckeln som secret

```bash
# Detta maste goras manuellt av sakerhetsskal
wrangler secret put AERODATABOX_API_KEY

# Klistra in din AeroDataBox API-nyckel nar du blir tillfragad
# (den syns inte nar du skriver/pastar - det ar normalt!)
```

### 7. Kontrollera att secreten ar satt

```bash
# Valfritt: Kor for-deploy check
npm run check-secrets
```

### 8. Deploya

```bash
# Deploya (inkluderar automatisk secret-check)
npm run deploy

# Eller direkt med wrangler
wrangler deploy
```

### 9. Ã–ppna appen

Efter deployment fÅ¥r du en URL som:
```
https://flight-stats-aerodatabox.<ditt-subdomain>.workers.dev
```

## � ± Lokal utveckling

### Starta utvecklingsserver

```bash
# Med wrangler
wrangler dev

# Eller med npm script
npm run dev
```

Appen kÃ¶r nu pÅ¥ `http://localhost:8787`

## � ¡ Projektstruktur

```
flight-stats-aerodatabox/
â»¡â»°â»° README.md
â»£â»°â»° index.html          # Frontend HTML (root, fÃ¶r enkelhet)
â»£â»°â»° styles.css          # CSS-styling
â»£â»°â»° app.js              # Frontend JavaScript
â»£â»°â»° worker.js           # Cloudflare Workers backend
â»£â»°â»° wrangler.toml       # Cloudflare Workers config
â»£â»°â»° package.json        # Dependencies
â»£â»°â»° .env.example        # MiljÃ¶variabler (exempel)
â»£â»°â»° .gitignore          # Git ignore
â»£â»°â»° public/             # Statiska filer fÃ¶r Workers Sites
â»£â»°â»° â”œâ»°â»° index.html
â»£â»°â»° â”œâ»°â»° styles.css
â»£â»°â»° â””â»°â»° app.js
â»£â»°â»° scripts/            # Helper scripts
â»£â»°â»° â””â»°â»° check-secrets.js
â»£â»°â»° DEPLOYMENT.md       # Alternativ deployment
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

Health check endpoint med API-nyckelvalidering.

**Svar:**
```json
{
  "status": "ok",
  "timestamp": "2026-08-23T08:53:00.000Z",
  "apiConfigured": true,
  "apiKeyValid": true,
  "apiKeyLength": 45,
  "hint": "API-nyckel ser giltig ut"
}
```

## ðŸ‡¸ Deployment

### Cloudflare Workers (Default)

```bash
# Installera Wrangler
npm install -g wrangler

# Logga in
wrangler login

# SÃ¤tt API-nyckel (maste goras manuellt)
wrangler secret put AERODATABOX_API_KEY

# Deploya (inkluderar automatisk secret-check)
npm run deploy

# Eller direkt
wrangler deploy
```

### Build & Deploy Commands

| Kommando | Beskrivning |
|----------|-------------|
| `wrangler dev` | Starta lokal utvecklingsserver |
| `wrangler deploy` | Bygg och deploya till produktion |
| `npm run dev` | Starta lokal utvecklingsserver |
| `npm run deploy` | Deploya med secret-check |
| `npm run check-secrets` | Kontrollera att secrets ar satt |
| `wrangler tail` | Se live logs |
| `wrangler secret put <NAME>` | SÃ¤tt hemlig variabel |

### Pre-deploy Check

`npm run deploy` kÃ¶r automatiskt en check som verifierar att `AERODATABOX_API_KEY` Ãr satt innan deployment.

Om secreten saknas fÅ¥r du ett tydligt felmeddelande med instruktioner.

### Alternativ: Node.js + Express

Se `DEPLOYMENT.md` fÃ¶r alternativ som Node.js, Vercel, Netlify, Railway, etc.

## ðŸ'¸ Kostnader

- **Cloudflare Workers:** Gratis upp till 100,000 requests/dag
- **AeroDataBox:** Gratis 600 API-enheter/mÅ¥nad (rÃ¤cker fÃ¶r ~20 requests/dag)

## ðŸ' Tips

### Gratis API-nycklar med ADS-B

Om du har en ADS-B-mottagare kan du feed:a data till AeroDataBox och fÅ¥ API-credits. LÃ¤s mer pÅ¥ [aerodatabox.com/contribute](https://aerodatabox.com/contribute).

### Snabbare builds

1. AnvÃ¤nd `bun` istÃ¤llet fÃ¶r `npm` (snabbare installation)
2. Commita lockfile (`bun.lockb`) fÃ¶r build caching
3. Uppdatera till senaste Wrangler: `npm install --save-dev wrangler@4`

### API-nyckelhantering

- API-nyckeln maste vara minst 32 tecken lang
- Spara den som Cloudflare Secret, inte i kod eller .env
- AnvÃ¤nd `/api/health` for att verifiera att nyckeln ar giltig

## Licens

MIT
