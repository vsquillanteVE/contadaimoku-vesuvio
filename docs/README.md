# Contadaimoku Vesuvio - Documentazione Tecnica

## Indice

1. [Introduzione](#introduzione)
2. [Architettura](#architettura)
3. [Backend](#backend)
   - [Tecnologie](#tecnologie-backend)
   - [Struttura del progetto](#struttura-del-progetto-backend)
   - [API](#api)
   - [Database](#database)
   - [Autenticazione](#autenticazione)
4. [Frontend](#frontend)
   - [Tecnologie](#tecnologie-frontend)
   - [Struttura del progetto](#struttura-del-progetto-frontend)
   - [Componenti](#componenti)
5. [Deployment](#deployment)
   - [Vercel](#vercel)
   - [Neon PostgreSQL](#neon-postgresql)
6. [Test](#test)
   - [Test unitari](#test-unitari)
   - [Test di integrazione](#test-di-integrazione)
   - [Test end-to-end](#test-end-to-end)
7. [Guida allo sviluppo](#guida-allo-sviluppo)
   - [Prerequisiti](#prerequisiti)
   - [Installazione](#installazione)
   - [Sviluppo locale](#sviluppo-locale)
   - [Build](#build)
   - [Deploy](#deploy)

## Introduzione

Contadaimoku Vesuvio è un'applicazione web che permette di visualizzare e aggiornare un messaggio condiviso e tenere traccia di un contatore. L'applicazione è composta da un frontend React e un backend Node.js con Express, con un database PostgreSQL per la persistenza dei dati.

## Architettura

L'applicazione segue un'architettura client-server:

- **Frontend**: Applicazione React che comunica con il backend tramite API REST.
- **Backend**: API REST sviluppata con Node.js e Express, che gestisce le richieste del frontend e comunica con il database.
- **Database**: PostgreSQL ospitato su Neon, che memorizza i dati dell'applicazione.

L'applicazione è deployata su Vercel, con il frontend e il backend ospitati come funzioni serverless.

## Backend

### Tecnologie Backend

- **Node.js**: Runtime JavaScript per l'esecuzione del codice server-side.
- **Express**: Framework web per la creazione di API REST.
- **TypeScript**: Superset di JavaScript che aggiunge tipizzazione statica.
- **PostgreSQL**: Database relazionale per la persistenza dei dati.
- **pg**: Client PostgreSQL per Node.js.
- **dotenv**: Gestione delle variabili d'ambiente.
- **Jest**: Framework di testing.

### Struttura del progetto Backend

```
backend/
├── dist/               # Codice compilato
├── src/                # Codice sorgente
│   ├── config/         # Configurazione dell'applicazione
│   ├── controllers/    # Controller per la gestione delle richieste
│   ├── middleware/     # Middleware Express
│   ├── routes/         # Definizione delle route
│   ├── services/       # Servizi per la logica di business
│   ├── tests/          # Test
│   └── index.ts        # Entry point dell'applicazione
├── .env                # Variabili d'ambiente (non versionato)
├── jest.config.js      # Configurazione Jest
├── package.json        # Dipendenze e script
├── tsconfig.json       # Configurazione TypeScript
└── vercel.json         # Configurazione Vercel
```

### API

#### Autenticazione

- `POST /api/auth/login`: Autentica un utente.
  - Request: `{ username: string, password: string }`
  - Response: `{ user: { id: number, username: string } }`

#### Contatore

- `GET /api/count`: Ottiene il valore attuale del contatore.
  - Response: `{ count: number }`
- `POST /api/count`: Incrementa il contatore.
  - Request: `{ amount?: number }` (default: 1)
  - Response: `{ count: number }`
- `POST /api/count/reset`: Resetta il contatore a 0.
  - Response: `{ success: boolean }`

#### Messaggio

- `GET /api/message`: Ottiene il messaggio attuale.
  - Response: `{ message: { content: string, htmlContent: string, fullContent: string, objectivesContent: string } }`
- `POST /api/message`: Aggiorna il messaggio (richiede autenticazione).
  - Request: `{ content: string, htmlContent: string, fullContent: string, objectivesContent: string, username: string, password: string }`
  - Response: `{ message: { content: string, htmlContent: string, fullContent: string, objectivesContent: string } }`
- `GET /api/message/history`: Ottiene la cronologia dei messaggi.
  - Response: `{ history: [{ id: number, content: string, html_content: string, full_content: string, objectives_content: string, created_at: string }] }`

#### Test

- `GET /api/test`: Verifica che l'API sia funzionante.
  - Response: `{ message: string, env: string, vercel: boolean }`
- `GET /api/test-db`: Verifica la connessione al database.
  - Response: `{ success: boolean, message: string }`

### Database

Il database PostgreSQL è ospitato su Neon e contiene le seguenti tabelle:

- **counter**: Memorizza il valore del contatore.
  - `id`: Identificativo univoco (SERIAL PRIMARY KEY)
  - `value`: Valore del contatore (INTEGER NOT NULL DEFAULT 0)

- **message**: Memorizza il messaggio attuale.
  - `id`: Identificativo univoco (SERIAL PRIMARY KEY)
  - `content`: Contenuto del messaggio (TEXT NOT NULL)
  - `html_content`: Contenuto HTML del messaggio (TEXT NOT NULL)
  - `full_content`: Contenuto completo del messaggio (TEXT NOT NULL)
  - `objectives_content`: Contenuto degli obiettivi (TEXT NOT NULL)

- **message_history**: Memorizza la cronologia dei messaggi.
  - `id`: Identificativo univoco (SERIAL PRIMARY KEY)
  - `content`: Contenuto del messaggio (TEXT NOT NULL)
  - `html_content`: Contenuto HTML del messaggio (TEXT NOT NULL)
  - `full_content`: Contenuto completo del messaggio (TEXT NOT NULL)
  - `objectives_content`: Contenuto degli obiettivi (TEXT NOT NULL)
  - `created_at`: Data di creazione (TIMESTAMP NOT NULL DEFAULT NOW())

- **users**: Memorizza gli utenti dell'applicazione.
  - `id`: Identificativo univoco (SERIAL PRIMARY KEY)
  - `username`: Nome utente (TEXT NOT NULL UNIQUE)
  - `password`: Password (TEXT NOT NULL)

### Autenticazione

L'autenticazione è gestita tramite username e password. Le credenziali vengono inviate nel corpo della richiesta e verificate contro il database. Se le credenziali sono valide, viene restituito un oggetto utente.

**Nota**: Questa implementazione è semplice e non utilizza token JWT o altre tecniche di autenticazione più avanzate. In un ambiente di produzione, sarebbe consigliabile utilizzare tecniche più sicure.

## Frontend

### Tecnologie Frontend

- **React**: Libreria JavaScript per la creazione di interfacce utente.
- **Vite**: Build tool per applicazioni web.
- **TypeScript**: Superset di JavaScript che aggiunge tipizzazione statica.
- **Axios**: Client HTTP per le richieste API.
- **React Router**: Routing per applicazioni React.
- **CSS Modules**: Stili CSS modulari.

### Struttura del progetto Frontend

```
frontend/
├── dist/               # Codice compilato
├── public/             # Asset statici
├── src/                # Codice sorgente
│   ├── assets/         # Asset (immagini, font, ecc.)
│   ├── components/     # Componenti React
│   ├── hooks/          # Hook personalizzati
│   ├── pages/          # Pagine dell'applicazione
│   ├── services/       # Servizi per le richieste API
│   ├── styles/         # Stili CSS
│   ├── types/          # Definizioni TypeScript
│   ├── App.tsx         # Componente principale
│   └── main.tsx        # Entry point dell'applicazione
├── index.html          # Template HTML
├── package.json        # Dipendenze e script
├── tsconfig.json       # Configurazione TypeScript
└── vite.config.ts      # Configurazione Vite
```

### Componenti

- **Header**: Intestazione dell'applicazione.
- **Footer**: Piè di pagina dell'applicazione.
- **Message**: Visualizza il messaggio corrente.
- **Counter**: Visualizza e permette di incrementare il contatore.
- **Login**: Form di login per l'autenticazione.
- **MessageForm**: Form per l'aggiornamento del messaggio.
- **MessageHistory**: Visualizza la cronologia dei messaggi.

## Deployment

### Vercel

L'applicazione è deployata su Vercel come funzioni serverless. La configurazione è definita nel file `vercel.json` nella root del progetto.

```json
{
  "buildCommand": "cd frontend && npm install && npm run build && cd ../backend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/backend/dist/index.js" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "env": {
    "DATABASE_URL": "postgres://neondb_owner:npg_LX1pK5triPfQ@ep-holy-breeze-a5vu69xw-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
    "VERCEL": "1"
  }
}
```

### Neon PostgreSQL

Il database PostgreSQL è ospitato su Neon, un servizio di database serverless. La connessione al database è configurata tramite la variabile d'ambiente `DATABASE_URL`.

## Test

### Test unitari

I test unitari verificano il funzionamento delle singole unità di codice (funzioni, classi, ecc.). Sono implementati con Jest e si trovano nella directory `src/tests`.

Per eseguire i test unitari:

```bash
npm test
```

### Test di integrazione

I test di integrazione verificano l'interazione tra diverse parti dell'applicazione. Sono implementati con Jest e Supertest e si trovano nella directory `src/tests/integration`.

Per eseguire i test di integrazione:

```bash
npm test
```

### Test end-to-end

I test end-to-end verificano il funzionamento dell'applicazione nel suo complesso. Sono implementati con Jest e Supertest e si trovano nella directory `src/tests/e2e`.

Per eseguire i test end-to-end:

```bash
npm test
```

## Guida allo sviluppo

### Prerequisiti

- Node.js (v14 o superiore)
- npm (v6 o superiore)
- PostgreSQL (opzionale per lo sviluppo locale)

### Installazione

1. Clona il repository:

```bash
git clone https://github.com/tuorepository/contadaimoku-vesuvio.git
cd contadaimoku-vesuvio
```

2. Installa le dipendenze del backend:

```bash
cd backend
npm install
```

3. Installa le dipendenze del frontend:

```bash
cd ../frontend
npm install
```

4. Crea un file `.env` nella directory `backend` con le seguenti variabili d'ambiente:

```
DATABASE_URL=postgres://neondb_owner:npg_LX1pK5triPfQ@ep-holy-breeze-a5vu69xw-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Sviluppo locale

1. Avvia il backend in modalità sviluppo:

```bash
cd backend
npm run dev
```

2. Avvia il frontend in modalità sviluppo:

```bash
cd frontend
npm run dev
```

3. Apri il browser all'indirizzo [http://localhost:5173](http://localhost:5173).

### Build

1. Compila il backend:

```bash
cd backend
npm run build
```

2. Compila il frontend:

```bash
cd frontend
npm run build
```

### Deploy

Il deploy avviene automaticamente quando viene effettuato un push sul branch principale del repository. Vercel rileva le modifiche e avvia un nuovo deploy.

Per effettuare un deploy manuale:

1. Installa la CLI di Vercel:

```bash
npm install -g vercel
```

2. Effettua il login:

```bash
vercel login
```

3. Esegui il deploy:

```bash
vercel --prod
```
