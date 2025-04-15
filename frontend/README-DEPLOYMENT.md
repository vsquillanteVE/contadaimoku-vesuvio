# ISTRUZIONI PER IL DEPLOYMENT

## IMPORTANTE: LEGGERE ATTENTAMENTE QUESTE ISTRUZIONI

Questo documento contiene le istruzioni per il deployment dell'applicazione Contadaimoku Vesuvio.

## Prerequisiti

- Node.js 18 o superiore
- npm 8 o superiore
- Git

## Procedura di Deployment

### 1. Clonare la repository

```bash
git clone https://github.com/vsquillanteVE/contadaimoku-vesuvio.git
cd contadaimoku-vesuvio
```

### 2. Installare le dipendenze

```bash
cd frontend
npm install
```

### 3. Eseguire la build

```bash
# Utilizzare il comando di build standard
npm run build
```

### 4. Se il comando precedente fallisce, utilizzare uno dei seguenti metodi alternativi:

#### Metodo 1: Utilizzare lo script build-prod.sh

```bash
# Rendere lo script eseguibile
chmod +x build-prod.sh

# Eseguire lo script
./build-prod.sh
```

#### Metodo 2: Utilizzare lo script build.js

```bash
# Eseguire lo script
node build.js
```

#### Metodo 3: Utilizzare direttamente Vite senza TypeScript

```bash
# Eseguire Vite direttamente
npx vite build
```

### 5. Copiare i file generati sul server web

I file generati si trovano nella cartella `frontend/dist`. Copiare questi file nella directory del server web.

## Risoluzione dei problemi

Se si verificano errori durante la build, provare i seguenti passaggi:

1. Assicurarsi di avere l'ultima versione del codice:
   ```bash
   git pull
   ```

2. Verificare che i file di configurazione siano corretti:
   - `package.json` dovrebbe avere `"build": "vite build"` negli script
   - `vite.config.ts` dovrebbe avere `typescript: false` nelle opzioni del plugin react

3. Se gli errori persistono, provare a eseguire la build con uno dei metodi alternativi descritti sopra.

## Configurazione del server web

Configurare il server web per servire i file statici dalla cartella `dist` e per gestire le route di React Router.

### Esempio di configurazione per Nginx

```nginx
server {
    listen 80;
    server_name contadaimoku-vesuvio.example.com;
    
    root /path/to/contadaimoku-vesuvio/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
