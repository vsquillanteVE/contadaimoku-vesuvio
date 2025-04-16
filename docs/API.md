# Documentazione delle API

## Indice

1. [Introduzione](#introduzione)
2. [Base URL](#base-url)
3. [Autenticazione](#autenticazione)
4. [Endpoint](#endpoint)
   - [Test](#test)
   - [Contatore](#contatore)
   - [Messaggio](#messaggio)
   - [Autenticazione](#endpoint-autenticazione)
5. [Modelli di dati](#modelli-di-dati)
6. [Codici di stato](#codici-di-stato)
7. [Gestione degli errori](#gestione-degli-errori)
8. [Esempi](#esempi)

## Introduzione

Questa documentazione descrive le API REST disponibili per l'applicazione Contadaimoku Vesuvio. Le API permettono di interagire con il contatore, il messaggio e il sistema di autenticazione.

## Base URL

Tutte le URL in questa documentazione hanno come base:

```
https://contadaimoku-vesuvio-be.vercel.app/api
```

## Autenticazione

Alcune API richiedono l'autenticazione. L'autenticazione viene effettuata inviando le credenziali (username e password) nel corpo della richiesta.

## Endpoint

### Test

#### GET /test

Verifica che l'API sia funzionante.

**Parametri**: Nessuno

**Risposta**:

```json
{
  "message": "API is working!",
  "env": "production",
  "vercel": true
}
```

#### GET /test-db

Verifica la connessione al database.

**Parametri**: Nessuno

**Risposta**:

```json
{
  "success": true,
  "message": "Database connection successful"
}
```

### Contatore

#### GET /count

Ottiene il valore attuale del contatore.

**Parametri**: Nessuno

**Risposta**:

```json
{
  "count": 42
}
```

#### POST /count

Incrementa il contatore.

**Parametri**:

| Nome   | Tipo   | Descrizione                                | Obbligatorio |
|--------|--------|--------------------------------------------|--------------| 
| amount | number | Quantità da incrementare (default: 1)      | No           |

**Esempio di richiesta**:

```json
{
  "amount": 5
}
```

**Risposta**:

```json
{
  "count": 47
}
```

#### POST /count/reset

Resetta il contatore a 0.

**Parametri**: Nessuno

**Risposta**:

```json
{
  "success": true
}
```

### Messaggio

#### GET /message

Ottiene il messaggio attuale.

**Parametri**: Nessuno

**Risposta**:

```json
{
  "message": {
    "content": "Niente può distruggere i tesori del cuore.",
    "htmlContent": "<p>Niente può distruggere i tesori del cuore.</p>",
    "fullContent": "<div class=\"message-highlight\"><p>Niente può distruggere i tesori del cuore.</p></div>",
    "objectivesContent": "<li>Realizziamo in Unità 10.000.000 di Daimoku per la protezione e la buona salute di tutti i praticanti e di tutti i cittadini del Vesuvio</li><li>Studiamo insieme le guide di Sensei</li>"
  }
}
```

#### POST /message

Aggiorna il messaggio (richiede autenticazione).

**Parametri**:

| Nome               | Tipo   | Descrizione                                | Obbligatorio |
|--------------------|--------|--------------------------------------------|--------------| 
| content            | string | Contenuto del messaggio                    | Sì           |
| htmlContent        | string | Contenuto HTML del messaggio               | Sì           |
| fullContent        | string | Contenuto completo del messaggio           | Sì           |
| objectivesContent  | string | Contenuto degli obiettivi                  | Sì           |
| username           | string | Nome utente per l'autenticazione           | Sì           |
| password           | string | Password per l'autenticazione              | Sì           |

**Esempio di richiesta**:

```json
{
  "content": "Nuovo messaggio",
  "htmlContent": "<p>Nuovo messaggio</p>",
  "fullContent": "<div class=\"message-highlight\"><p>Nuovo messaggio</p></div>",
  "objectivesContent": "<li>Nuovo obiettivo</li>",
  "username": "admin",
  "password": "vesuvio2025"
}
```

**Risposta**:

```json
{
  "message": {
    "content": "Nuovo messaggio",
    "htmlContent": "<p>Nuovo messaggio</p>",
    "fullContent": "<div class=\"message-highlight\"><p>Nuovo messaggio</p></div>",
    "objectivesContent": "<li>Nuovo obiettivo</li>"
  }
}
```

#### GET /message/history

Ottiene la cronologia dei messaggi.

**Parametri**:

| Nome  | Tipo   | Descrizione                                      | Obbligatorio |
|-------|--------|--------------------------------------------------|--------------| 
| limit | number | Numero massimo di messaggi da restituire (default: 10) | No           |

**Risposta**:

```json
{
  "history": [
    {
      "id": 1,
      "content": "Messaggio precedente",
      "html_content": "<p>Messaggio precedente</p>",
      "full_content": "<div>Messaggio precedente</div>",
      "objectives_content": "<li>Obiettivo precedente</li>",
      "created_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Endpoint Autenticazione

#### POST /auth/login

Autentica un utente.

**Parametri**:

| Nome     | Tipo   | Descrizione                                | Obbligatorio |
|----------|--------|--------------------------------------------|--------------| 
| username | string | Nome utente                                | Sì           |
| password | string | Password                                   | Sì           |

**Esempio di richiesta**:

```json
{
  "username": "admin",
  "password": "vesuvio2025"
}
```

**Risposta**:

```json
{
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

## Modelli di dati

### Message

| Campo              | Tipo   | Descrizione                                |
|--------------------|--------|--------------------------------------------| 
| content            | string | Contenuto del messaggio                    |
| htmlContent        | string | Contenuto HTML del messaggio               |
| fullContent        | string | Contenuto completo del messaggio           |
| objectivesContent  | string | Contenuto degli obiettivi                  |

### MessageHistoryItem

| Campo               | Tipo   | Descrizione                                |
|---------------------|--------|--------------------------------------------| 
| id                  | number | Identificativo univoco                     |
| content             | string | Contenuto del messaggio                    |
| html_content        | string | Contenuto HTML del messaggio               |
| full_content        | string | Contenuto completo del messaggio           |
| objectives_content  | string | Contenuto degli obiettivi                  |
| created_at          | string | Data di creazione (formato ISO 8601)       |

### User

| Campo     | Tipo   | Descrizione                                |
|-----------|--------|--------------------------------------------| 
| id        | number | Identificativo univoco                     |
| username  | string | Nome utente                                |

## Codici di stato

| Codice | Descrizione                                                |
|--------|------------------------------------------------------------|
| 200    | OK - La richiesta è stata completata con successo          |
| 400    | Bad Request - La richiesta contiene parametri non validi   |
| 401    | Unauthorized - Autenticazione richiesta o non valida       |
| 404    | Not Found - La risorsa richiesta non esiste                |
| 500    | Internal Server Error - Errore interno del server          |

## Gestione degli errori

In caso di errore, l'API restituisce un oggetto JSON con i seguenti campi:

| Campo   | Tipo   | Descrizione                                |
|---------|--------|--------------------------------------------| 
| error   | string | Descrizione dell'errore                    |
| message | string | Messaggio dettagliato dell'errore (opzionale) |

**Esempio**:

```json
{
  "error": "Invalid credentials"
}
```

## Esempi

### Esempio 1: Incrementare il contatore

**Richiesta**:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"amount": 5}' https://contadaimoku-vesuvio-be.vercel.app/api/count
```

**Risposta**:

```json
{
  "count": 47
}
```

### Esempio 2: Aggiornare il messaggio

**Richiesta**:

```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "content": "Nuovo messaggio",
  "htmlContent": "<p>Nuovo messaggio</p>",
  "fullContent": "<div class=\"message-highlight\"><p>Nuovo messaggio</p></div>",
  "objectivesContent": "<li>Nuovo obiettivo</li>",
  "username": "admin",
  "password": "vesuvio2025"
}' https://contadaimoku-vesuvio-be.vercel.app/api/message
```

**Risposta**:

```json
{
  "message": {
    "content": "Nuovo messaggio",
    "htmlContent": "<p>Nuovo messaggio</p>",
    "fullContent": "<div class=\"message-highlight\"><p>Nuovo messaggio</p></div>",
    "objectivesContent": "<li>Nuovo obiettivo</li>"
  }
}
```

### Esempio 3: Autenticare un utente

**Richiesta**:

```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "username": "admin",
  "password": "vesuvio2025"
}' https://contadaimoku-vesuvio-be.vercel.app/api/auth/login
```

**Risposta**:

```json
{
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```
