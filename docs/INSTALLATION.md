# Guida all'installazione

## Indice

1. [Prerequisiti](#prerequisiti)
2. [Installazione locale](#installazione-locale)
   - [Clonare il repository](#clonare-il-repository)
   - [Installare le dipendenze](#installare-le-dipendenze)
   - [Configurare le variabili d'ambiente](#configurare-le-variabili-dambiente)
3. [Sviluppo locale](#sviluppo-locale)
   - [Avviare il backend](#avviare-il-backend)
   - [Avviare il frontend](#avviare-il-frontend)
4. [Build](#build)
   - [Build del backend](#build-del-backend)
   - [Build del frontend](#build-del-frontend)
5. [Deploy](#deploy)
   - [Deploy su Vercel](#deploy-su-vercel)
   - [Configurazione del database Neon](#configurazione-del-database-neon)
6. [Troubleshooting](#troubleshooting)

## Prerequisiti

Prima di iniziare, assicurati di avere installato:

- **Node.js** (v14 o superiore)
- **npm** (v6 o superiore)
- **Git**

## Installazione locale

### Clonare il repository

```bash
# Clona il repository
git clone https://github.com/tuorepository/contadaimoku-vesuvio.git

# Entra nella directory del progetto
cd contadaimoku-vesuvio
```

### Installare le dipendenze

```bash
# Installa le dipendenze del backend
cd backend
npm install

# Torna alla directory principale
cd ..

# Installa le dipendenze del frontend
cd frontend
npm install

# Torna alla directory principale
cd ..
```

### Configurare le variabili d'ambiente

Crea un file `.env` nella directory `backend` con le seguenti variabili d'ambiente:

```
# Recommended for most uses
DATABASE_URL=postgres://neondb_owner:npg_LX1pK5triPfQ@ep-holy-breeze-a5vu69xw-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

# For uses requiring a connection without pgbouncer
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_LX1pK5triPfQ@ep-holy-breeze-a5vu69xw.us-east-2.aws.neon.tech/neondb?sslmode=require

# Parameters for constructing your own connection string
PGHOST=ep-holy-breeze-a5vu69xw-pooler.us-east-2.aws.neon.tech
PGHOST_UNPOOLED=ep-holy-breeze-a5vu69xw.us-east-2.aws.neon.tech
PGUSER=neondb_owner
PGDATABASE=neondb
PGPASSWORD=npg_LX1pK5triPfQ

# Parameters for Vercel Postgres Templates
POSTGRES_URL=postgres://neondb_owner:npg_LX1pK5triPfQ@ep-holy-breeze-a5vu69xw-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL_NON_POOLING=postgres://neondb_owner:npg_LX1pK5triPfQ@ep-holy-breeze-a5vu69xw.us-east-2.aws.neon.tech/neondb?sslmode=require
POSTGRES_USER=neondb_owner
POSTGRES_HOST=ep-holy-breeze-a5vu69xw-pooler.us-east-2.aws.neon.tech
POSTGRES_PASSWORD=npg_LX1pK5triPfQ
POSTGRES_DATABASE=neondb
POSTGRES_URL_NO_SSL=postgres://neondb_owner:npg_LX1pK5triPfQ@ep-holy-breeze-a5vu69xw-pooler.us-east-2.aws.neon.tech/neondb
POSTGRES_PRISMA_URL=postgres://neondb_owner:npg_LX1pK5triPfQ@ep-holy-breeze-a5vu69xw-pooler.us-east-2.aws.neon.tech/neondb?connect_timeout=15&sslmode=require
```

## Sviluppo locale

### Avviare il backend

```bash
# Entra nella directory del backend
cd backend

# Avvia il server di sviluppo
npm run dev
```

Il backend sarà disponibile all'indirizzo [http://localhost:3001](http://localhost:3001).

### Avviare il frontend

```bash
# Entra nella directory del frontend
cd frontend

# Avvia il server di sviluppo
npm run dev
```

Il frontend sarà disponibile all'indirizzo [http://localhost:5173](http://localhost:5173).

## Build

### Build del backend

```bash
# Entra nella directory del backend
cd backend

# Compila il codice TypeScript
npm run build
```

I file compilati saranno disponibili nella directory `backend/dist`.

### Build del frontend

```bash
# Entra nella directory del frontend
cd frontend

# Compila il codice
npm run build
```

I file compilati saranno disponibili nella directory `frontend/dist`.

## Deploy

### Deploy su Vercel

1. Crea un account su [Vercel](https://vercel.com/) se non ne hai già uno.

2. Installa la CLI di Vercel:

```bash
npm install -g vercel
```

3. Effettua il login:

```bash
vercel login
```

4. Esegui il deploy:

```bash
# Dalla directory principale del progetto
vercel --prod
```

5. Segui le istruzioni a schermo per completare il deploy.

### Configurazione del database Neon

1. Crea un account su [Neon](https://neon.tech/) se non ne hai già uno.

2. Crea un nuovo progetto.

3. Crea un nuovo database.

4. Ottieni la stringa di connessione dal dashboard di Neon.

5. Aggiorna il file `.env` con la nuova stringa di connessione.

6. Aggiorna le variabili d'ambiente su Vercel:
   - Vai al dashboard di Vercel
   - Seleziona il tuo progetto
   - Vai alla sezione "Settings" > "Environment Variables"
   - Aggiungi la variabile `DATABASE_URL` con la stringa di connessione di Neon

## Troubleshooting

### Problemi di connessione al database

Se riscontri problemi di connessione al database, verifica:

1. Che le variabili d'ambiente siano configurate correttamente.
2. Che il database sia accessibile dalla tua rete.
3. Che le credenziali siano corrette.

### Problemi di CORS

Se riscontri problemi di CORS, verifica:

1. Che il frontend stia utilizzando l'URL corretto per il backend.
2. Che il backend abbia configurato correttamente gli header CORS.

### Problemi di build

Se riscontri problemi durante la build, verifica:

1. Che tutte le dipendenze siano installate.
2. Che il codice TypeScript non contenga errori.
3. Che la configurazione di TypeScript sia corretta.

### Problemi di deploy

Se riscontri problemi durante il deploy su Vercel, verifica:

1. Che il file `vercel.json` sia configurato correttamente.
2. Che le variabili d'ambiente siano configurate correttamente su Vercel.
3. Che il progetto sia stato buildato correttamente prima del deploy.
