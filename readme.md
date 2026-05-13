# Standards de Développement Microservices

> Document de référence obligatoire — tout code doit respecter ces standards avant validation.

---

## Table des matières

- [1. Objectif](#1-objectif)
- [2. Conventions de nommage](#2-conventions-de-nommage)
- [3. Structure d'un microservice](#3-structure-dun-microservice)
- [4. Nommage des fichiers et dossiers](#4-nommage-des-fichiers-et-dossiers)
- [5. Organisation du code](#5-organisation-du-code)
- [6. Répertoire lib](#6-répertoire-lib)
- [7. Variables d'environnement](#7-variables-denvironnement)
- [8. Dépendances minimales](#8-dépendances-minimales)
- [9. Installation d'un microservice](#9-installation-dun-microservice)
- [10. Lancement](#10-lancement)
- [11. Lancement global — Monorepo](#11-lancement-global--monorepo)
- [12. Bonnes pratiques](#12-bonnes-pratiques)
- [13. Sécurité](#13-sécurité)
- [14. Principes d'architecture](#14-principes-darchitecture)

---

## 1. Objectif

Ce document définit les standards de développement à respecter dans l'ensemble du backend pour garantir :

- la **cohérence** globale du code entre les équipes
- la **maintenabilité** sur le long terme
- la **scalabilité** des microservices
- une **collaboration** fluide entre développeurs

---

## 2. Conventions de nommage

| Élément | Convention | Exemple |
| --- | --- | --- |
| Variables | `snake_case` | `user_id`, `payment_status` |
| Fonctions | `camelCase` | `createUserAccount()` |
| Classes | `PascalCase` | `UserService`, `PaymentController` |
| Fichiers | `kebab-case` | `user-controller.ts` |
| Dossiers | `kebab-case` | `auth-service/` |

```ts
// Variables
const user_id = 10;
const payment_status = "SUCCESS";

// Fonctions
function createUserAccount() {}
function validatePaymentRequest() {}

// Classes
class UserService {}
class PaymentController {}
```

---

## 3. Structure d'un microservice

```
service-name/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── controllers/      # Gestion des requêtes HTTP
│   ├── services/         # Logique métier
│   ├── routes/           # Définition des endpoints
│   ├── middlewares/      # Auth, validation, erreurs
│   ├── lib/              # Fonctions génériques internes
│   ├── types/            # Typage TypeScript partagé
│   ├── utils/            # Utilitaires divers
│   └── server.ts         # Point d'entrée
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 4. Nommage des fichiers et dossiers

Tous les fichiers et dossiers utilisent le format `kebab-case`.

```
# Fichiers
user-controller.ts
payment-service.ts
auth-middleware.ts

# Dossiers
auth-service/
payment-service/
```

---

## 5. Organisation du code

| Couche | Rôle |
| --- | --- |
| `controllers/` | Gèrent les requêtes HTTP entrantes |
| `services/` | Contiennent la logique métier |
| `routes/` | Définissent les endpoints REST |
| `middlewares/` | Auth, validation, gestion d'erreurs |

> Les controllers appellent les services. Les services traitent la donnée. Ne jamais mélanger les deux.

---

## 6. Répertoire lib

Le dossier `lib/` contient des fonctions génériques et réutilisables, sans logique métier.

```ts
// lib/crypto.ts
export function hashPassword(password: string): string {}

// lib/jwt.ts
export function generateToken(payload: object): string {}
```

**Règles :**

- pas de logique métier
- fonctions réutilisables entre modules
- indépendant de tout service spécifique

---

## 7. Variables d'environnement

```env
PORT=3300
DATABASE_URL=postgresql://user:password@localhost:5432/db
JWT_SECRET=your_secret_key
NODE_ENV=development
```

**Règles :**

- ne jamais committer `.env` — l'ajouter dans `.gitignore`
- toujours fournir un fichier `.env.example` documenté
- charger les variables avec `dotenv`
- valider la présence des variables critiques au démarrage

---

## 8. Dépendances minimales

```json
{
  "dependencies": {
    "@prisma/client": "^7.7.0",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "prisma": "^7.7.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^22.0.0",
    "tsx": "^4.21.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 9. Installation d'un microservice

**1. Créer le service**

```bash
mkdir auth-service
cd auth-service
npm init -y
```

**2. Installer les dépendances**

```bash
npm install express dotenv @prisma/client prisma
npm install -D typescript tsx @types/node @types/express
```

**3. Initialiser Prisma**

```bash
npx prisma init
```

**4. Initialiser TypeScript**

```bash
npx tsc --init
```

---

## 10. Lancement

**Mode développement**

```bash
npx tsx src/server.ts
```

**Avec rechargement automatique**

```json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
}
```

```bash
npm run dev
```

---

## 11. Lancement global — Monorepo

```bash
# Installer toutes les dépendances
npm install

# Lancer un service spécifique
npm run dev --workspace=auth-service
npm run dev --workspace=payment-service
```

---

## 12. Bonnes pratiques

**À faire**

- respecter la séparation des responsabilités entre couches
- utiliser un dossier `shared/` pour le code commun
- centraliser les types TypeScript dans `src/types/`
- gérer les erreurs via un middleware global
- documenter chaque service avec son propre `README.md`

**À éviter**

- mélanger logique métier et controllers
- dupliquer du code entre services
- hardcoder des valeurs sensibles
- coupler fortement deux microservices

---

## 13. Sécurité

| Pratique | Description |
| --- | --- |
| Validation des entrées | Valider chaque donnée reçue (body, params, query) |
| JWT | Protéger les routes avec authentification par token |
| Variables sensibles | Stocker dans `.env`, jamais dans le code |
| Logging | Logger les connexions, erreurs et accès refusés |
| HTTPS | Obligatoire en production |

---

## 14. Principes d'architecture

```
1 microservice  =  1 responsabilité métier
1 microservice  =  1 base de données dédiée
Communication   =  API REST ou événements asynchrones
Partage de code =  uniquement via un package shared/ commun
```

Aucun service ne doit importer directement le code métier d'un autre service.

---

> **Prochaine étape** : générer un template complet prêt à cloner (`auth-service` ou `payment-service`) avec le code déjà structuré.