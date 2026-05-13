# 📄 Documentation Technique - Payment API Backend

## 1. 🧱 Architecture Globale du Projet

Le projet repose sur une **architecture orientée microservices** implémentée sous la forme d'un **Monorepo** (géré via les Workspaces de npm). 

Ce choix d'architecture répond à un besoin de séparation des responsabilités, facilitant ainsi la scalabilité indépendante des différents domaines métiers et le travail en équipe. 

Les différentes couches de l'architecture sont :
- **API Gateway (Passerelle)** : Point d'entrée unique pour les clients. Elle a pour rôle de router les requêtes vers les bons microservices sous-jacents, de gérer potentiellement la limitation de débit (rate limiting) ou l'authentification globale.
- **Couche Services (Microservices)** : Contient les différentes briques logicielles autonomes (ex: `auth-service`, `payment-service`). Chaque service est responsable d'un domaine métier spécifique et possède sa propre logique.
- **Couche Partagée (Shared Package)** : Centralise le code commun à l'ensemble des microservices pour éviter la duplication et garantir une cohérence globale (gestion des erreurs, types TypeScript, utilitaires).

---

## 2. 📦 Arborescence Complète du Projet

L'arborescence du monorepo est organisée de la manière suivante :

```text
backend/
├── api-gateway/            # Point d'entrée unique de l'API
├── packages/
│   └── shared/             # Librairie interne partagée entre les microservices
│       ├── errorsHandlers/ # Gestion centralisée et standardisée des erreurs
│       ├── types/          # Interfaces et types TypeScript communs
│       ├── utils/          # Fonctions utilitaires transversales
│       └── index.ts        # Point d'exportation de la librairie
├── services/
│   ├── auth-service/       # Microservice gérant l'authentification et les utilisateurs
│   │   ├── prisma/         # Configuration et schémas de la base de données
│   │   └── src/            # Code source du service
│   └── payment-service/    # Microservice gérant les transactions et paiements
├── package.json            # Configuration du monorepo et des workspaces
└── tsconfig.base.json      # Configuration TypeScript racine (héritée par les autres)
```

**Rôle du package `shared` :**
Le dossier `packages/shared` est crucial dans cette architecture. Il agit comme une dépendance interne pour les autres services. Il permet de centraliser la définition des types (pour une communication inter-services fortement typée), la logique de gestion des erreurs (pour renvoyer des formats d'erreur standardisés) et les helpers divers.

---

## 3. 🔧 Les Microservices

Actuellement, l'architecture prévoit deux microservices principaux.

### A. Auth Service (`auth-service`)
- **Rôle fonctionnel** : Gestion de l'identité, de l'inscription, de la connexion et de la validation des sessions utilisateurs.
- **Responsabilités** : 
  - Hachage et vérification des mots de passe.
  - Génération et validation des tokens (ex: JWT).
  - Persistance des données utilisateurs (via PostgreSQL).
- **Dépendances principales** : Express (serveur HTTP), Prisma (ORM), dotenv (variables d'environnement).
- **Communication** : Expose ses endpoints (actuellement sur le port `3300`) pour l'API Gateway.

### B. Payment Service (`payment-service`)
- **Rôle fonctionnel** : Gestion du tunnel de paiement et des transactions.
- **Responsabilités** : 
  - Initialisation et validation des paiements.
  - Historique des transactions.
  - Interaction avec d'éventuels prestataires de paiement externes (Stripe, PayPal, etc.).
- **Communication** : Devra communiquer de manière sécurisée (souvent via réseau interne ou broker de messages) avec `auth-service` pour valider l'identité de l'émetteur d'un paiement.

---

## 4. 📚 Les Dépendances Utilisées

La gestion des dépendances est optimisée pour correspondre aux standards Node.js modernes.

**Dépendances de Production :**
- **`express` (v5)** : Framework web minimaliste et ultra-performant pour créer les serveurs API.
- **`@prisma/client` & `prisma` (v7)** : ORM moderne, garantissant un typage strict (Type-Safe) de bout en bout entre la base de données et TypeScript.
- **`dotenv`** : Chargement sécurisé des variables d'environnement.
- *(À venir selon le besoin)* : `axios` pour la communication synchrone inter-services, ou `jsonwebtoken` pour la sécurité.

**Dépendances de Développement :**
- **`typescript` & `@types/node`/`@types/express`** : Permettent le typage statique, l'autocomplétion avancée et la détection d'erreurs à la compilation.
- **`cross-env`** (au niveau racine) : Assure l'injection de variables d'environnement de manière uniforme, quel que soit le système d'exploitation des développeurs (Windows, Mac, Linux).
- **`tsx` / `nodemon`** : Outils de rechargement à chaud (Hot-Reload) pour une expérience de développement fluide sans redémarrer manuellement les serveurs.

---

## 5. ⚙️ Configuration Technique

- **TypeScript** : 
  - L'approche est centralisée : un fichier `tsconfig.base.json` à la racine définit les règles strictes (`"strict": true`, `"target": "ES2020"`). 
  - Chaque microservice possède un `tsconfig.json` très léger qui étend (`extends`) la base. Cela garantit l'homogénéité du code (même niveau d'exigence) sur l'ensemble du projet.
- **Prisma** : 
  - Configuré pour cibler une base de données **PostgreSQL**.
  - Le schéma Prisma (`schema.prisma`) est localisé au sein du service qui en a la responsabilité (principe d'isolation des bases de données en architecture microservices).
- **Gestion des modules** : Le monorepo utilise les espaces de travail natifs (`"workspaces": ["services/*", "api-gateway", "packages/*"]`) permettant aux services d'importer le package `shared` comme une dépendance npm classique sans nécessiter de publication sur un registre externe.

---

## 6. 🔐 Gestion des Environnements

- **Stratégie `.env`** : Chaque microservice possède son propre fichier `.env`. Cela respecte le principe de séparation des préoccupations (Separation of Concerns). Un service n'a accès qu'aux variables qui lui sont strictement nécessaires.
- **Gestion des ports** : Les ports sont distribués de manière unique. Par exemple, l'API Gateway tournera typiquement sur le port `80` ou `3000`, tandis que le `auth-service` écoute en interne sur le port `3300`. 

---

## 7. 🚀 Flux Global du Système

1. **Requête Client** : Une application front-end ou mobile envoie une requête HTTP (ex: POST `/api/auth/login`).
2. **API Gateway** : La Gateway intercepte la requête. Elle peut vérifier des règles générales de sécurité (Rate Limit, CORS) puis redirige (Proxy) la requête vers le microservice concerné (ici, `auth-service` sur le port `3300`).
3. **Traitement (Microservice)** : Le service cible exécute la logique métier. S'il a besoin de persister ou de lire des données, il utilise Prisma pour interroger sa propre base de données PostgreSQL isolée.
4. **Réponse** : Le microservice formate sa réponse en utilisant potentiellement les standards définis dans le package `shared` et la retourne à la Gateway, qui la transfère au client.

---

## 8. 📈 Qualités de l'Architecture

- **Isolation & Couplage Faible** : Si le service de paiement tombe en panne, le service d'authentification peut continuer de fonctionner. Chaque équipe peut déployer son service indépendamment.
- **Scalabilité** : Il est possible d'allouer plus de ressources serveurs uniquement au `payment-service` lors de fortes charges (ex: Black Friday) sans dupliquer le reste de l'application.
- **Maintenabilité** : Le Monorepo facilite les refactorisations globales et les mises à jour de dépendances. Le package partagé `shared` garantit qu'une correction sur la gestion des erreurs est appliquée partout en une seule fois.
- **Sécurité Typée** : L'association de TypeScript et de Prisma offre une intégrité des données "End-to-End", réduisant drastiquement les bugs en production.

---

## 9. 🎯 Conclusion

Pour clôturer cette présentation :
*"Ce backend a été conçu selon les standards de l'industrie avec une architecture microservices en Monorepo. En combinant l'écosystème Node.js/TypeScript avec Prisma et Express, nous obtenons un système hautement modulaire, robuste et prêt à scaler. L'utilisation d'une API Gateway et d'un package partagé garantit à la fois une excellente expérience développeur (DX) et une architecture propre permettant à notre plateforme de paiement d'évoluer sereinement et de manière sécurisée."*
