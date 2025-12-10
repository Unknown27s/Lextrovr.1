# 📚 Author Vocabulary Companion

A **lightweight PWA** for vocabulary learning that works entirely in the browser.

**Zero backend. Zero database. Zero monthly costs. Forever free.** ✨

---

## 🎯 Key Features

- ✅ **No Backend Required** - Entire app runs in browser
- ✅ **Free Dictionary API** - Definitions, synonyms, examples
- ✅ **Offline Support** - Works completely offline with PWA
- ✅ **Local Storage** - All data stored in browser (no cloud sync needed)
- ✅ **Dark Mode** - Beautiful dark/light themes
- ✅ **Free Deployment** - Deploy to Vercel/Netlify for $0/month forever
- ✅ **Practice Exercises** - Generate quizzes locally
- ✅ **Use in Document** - Get writing examples with different voices

---

## 📊 Architecture

```
┌─────────────────────────────────┐
│   Browser (React + PWA)         │
│                                 │
│  ├─ Search & Display            │
│  ├─ localStorage (user data)    │
│  ├─ IndexedDB (vocab cache)    │
│  └─ Service Worker (offline)   │
│                                 │
├─ Free Dictionary API (read-only)│
└─────────────────────────────────┘

💰 Cost: $0/month forever
```

---

## 🚀 Quick Start

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🌐 Deploy for Free

See [DEPLOY-FREE.md](DEPLOY-FREE.md) for step-by-step instructions.

**TL;DR:**
1. Push to GitHub
2. Connect to Vercel or Netlify
3. Done! Your app is live and free forever

---

## 📁 Project Structure

```
.
└── frontend/              # React + Vite PWA (the entire app!)
    ├── src/
    │   ├── components/    # React components
    │   ├── api/           # Dictionary API client + localStorage
    │   ├── store/         # Redux state management
    │   ├── services/      # Offline & cache services
    │   └── styles/        # Tailwind CSS
    ├── public/            # PWA manifest, icons, service worker
    └── package.json
```

## 📚 Project Structure

```
.
├── backend/              # NestJS API server
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── entities/     # TypeORM entities
│   │   ├── modules/      # Functional modules
│   │   │   ├── vocab/
│   │   │   ├── user-vocab/
│   │   │   ├── practice/
│   │   │   └── ai/
│   │   ├── database/     # Migrations
│   │   └── config/
│   └── package.json
│
└── frontend/             # React + Vite PWA
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── components/   # React components
    │   ├── pages/        # Page routes
    │   ├── api/          # API client
    │   ├── store/        # Redux state
    │   ├── services/     # Sync, Offline, Push
    │   └── styles/
    ├── public/           # PWA manifest, icons
    └── package.json
```

## 🚀 Getting Started

### Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database and API keys

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🔧 Key Features

- ✅ **Infinite Scroll Feed** - cursor-based pagination with vocabulary cards
- ✅ **Daily Word** - personalized daily vocabulary with banner
- ✅ **Dictionary API** - integrates `https://api.dictionaryapi.dev/api/v2/entries/en/<word>`
- ✅ **Practice Exercises** - fill-blank, choose synonym, writing prompts
- ✅ **Offline-First** - SQLite caching with automatic sync when online
- ✅ **Push Notifications** - daily word reminders via FCM
- ✅ **AI Integration** - example sentences in user's writing voice
- ✅ **PWA Support** - installable on web and Android via Capacitor
- ✅ **Dark Mode** - Tailwind CSS with dark theme support

## 📱 PWA & Mobile

### Build PWA

```bash
cd frontend
npm run build:pwa
```

### Build Android App

```bash
cd frontend
npm run android
```

## 🗄️ Database

### PostgreSQL Schema

Tables:
- `vocab_items` - dictionary entries with definitions and examples
- `user_vocab` - user's saved vocabulary with practice scores
- `practice_results` - practice exercise attempts and scoring
- `vocab_feed_cache` - cached feed pages for offline access

### Run Migrations

```bash
cd backend
npm run migration:run
```

## 🔌 API Endpoints

### Vocabulary
- `GET /vocab/feed?cursor=...&limit=20` - paginated feed
- `GET /vocab/daily` - today's featured word
- `GET /vocab/:id` - get single vocab item
- `GET /vocab/search/:word` - search or fetch from dictionary API

### User Vocabulary
- `GET /user-vocab` - user's saved vocabulary
- `POST /user-vocab` - save a word
- `PATCH /user-vocab/:id/status` - update status (saved/learning/mastered)
- `POST /user-vocab/sync` - sync offline changes

### Practice
- `GET /practice/:vocabId/exercise` - generate exercise
- `POST /practice/submit` - submit answer and get score
- `GET /practice/:vocabId/stats` - practice statistics

### AI
- `POST /ai/generate-example` - generate example sentence in user's voice
- `POST /ai/rank-synonyms` - rank synonyms by relevance

## 🔐 Authentication

JWT tokens stored in localStorage. Add `Authorization: Bearer {token}` header to protected endpoints.

```typescript
// Frontend: Auto-added by apiClient interceptor
const token = localStorage.getItem('auth_token');
```

## 💾 Offline Sync

When offline:
1. **Cache** - Feed and user vocab stored in IndexedDB (via Dexie)
2. **Queue** - Changes queued locally with timestamps
3. **Reconnect** - Automatic sync when online using exponential backoff
4. **Conflict** - Server timestamps + last-write-wins strategy

See `frontend/src/services/offline.ts` and `frontend/src/services/sync.ts`.

## 🔔 Push Notifications

- **Client** → Capacitor + Firebase Cloud Messaging
- **Server** → Firebase Admin SDK sends notifications
- **Payload** includes: title, body, vocab_item_id, exercise type

Register token: `POST /push/subscribe`

## 🎨 UI/UX

### Components
- `VocabCard` - displays word with definition, examples, synonyms
- `VocabFeed` - infinite scroll container
- `DailyWordBanner` - featured daily word
- `PracticeModal` - micro-exercises
- `UseInDocumentOverlay` - preview word in user's writing
- `FiltersBar` - filter by difficulty, POS, voice
- `SyncIndicator` - offline/sync status

Styled with Tailwind CSS + custom utilities. Dark mode supported.

## 🧪 Testing

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

## 📚 External APIs

- **Dictionary API**: `https://api.dictionaryapi.dev/api/v2/entries/en/<word>`
  - Free, no auth required
  - Returns definitions, examples, synonyms, audio

- **OpenAI API** (optional):
  - For AI example generation
  - Set `OPENAI_API_KEY` in backend `.env`
  - Falls back to heuristic generation if not configured

## 🚢 Deployment

### Backend (NestJS)
- Dockerfile provided
- Deploy to: Heroku, Railway, AWS, GCP, etc.
- Set `DATABASE_URL` and other env vars

### Frontend (Vite PWA)
- Static build in `dist/`
- Deploy to: Vercel, Netlify, GitHub Pages, etc.
- PWA manifest auto-served at `/manifest.json`

## 📖 Documentation

- API OpenAPI spec: `backend/openapi.yaml` (generate with `@nestjs/swagger`)
- Database schema: `backend/src/database/migrations/`
- Service architecture: See individual service files

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push: `git push origin feature/your-feature`
4. Open PR

## 📄 License

MIT

## 🆘 Support

For issues or feature requests, open an issue on GitHub.

---

**Built with ❤️ for authors and language learners**
