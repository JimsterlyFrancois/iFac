# iFac + - Application de Gestion de Documents Universitaires

## 📋 Description
iFac + est une application complète pour la gestion et la distribution ciblée de documents universitaires. Conçue pour fonctionner en **ligne et hors ligne**, compatible avec **web, mobile et tablette**.

## 🚀 Stack Technologique
- **Backend**: Node.js/Express + SQLite/PostgreSQL
- **Frontend**: React/Vite + React Query
- **Mobile**: React Native (Expo)
- **Offline**: SQLite + Redux Persist
- **Real-time Sync**: Service Workers + Background Sync API

## 📦 Structure du Projet
```
iFac/
├── server/              # Backend Node.js/Express
│   ├── middleware/      # Auth, validation, errors
│   ├── routes/          # API endpoints
│   ├── models/          # Database models
│   ├── config/          # Configuration files
│   └── index.js         # Entry point
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API calls
│   │   ├── store/       # Redux state
│   │   └── App.jsx
│   └── package.json
├── database/            # Database schemas
│   └── schema.sql
└── scripts/             # Setup scripts
```

## 🔧 Installation & Setup

### Backend
```bash
npm install
cp .env.example .env
npm run db:seed
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## 🔐 Admin Access
- **Email**: jimsterlyfrancois@gmail.com
- **Accès**: Espace Admin (Admin Panel) avec gestion des documents

## 📱 Fonctionnalités
- ✅ Authentification sécurisée (JWT)
- ✅ Distribution ciblée de documents
- ✅ Synchronisation offline/online
- ✅ Espace Admin (jimsterlyfrancois@gmail.com uniquement)
- ✅ Responsive design (mobile, tablette, PC)

## 📚 API Endpoints
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/documents` - Récupérer documents
- `POST /api/documents` - Créer document (Admin)
- `PUT /api/documents/:id` - Modifier (Admin)
- `DELETE /api/documents/:id` - Supprimer (Admin)

## 📄 Licence
MIT
