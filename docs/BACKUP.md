# Sistema di Backup Automatico

## Indice

1. [Introduzione](#introduzione)
2. [Funzionalità](#funzionalità)
3. [Implementazione](#implementazione)
4. [API](#api)
5. [Configurazione](#configurazione)
6. [Troubleshooting](#troubleshooting)

## Introduzione

Il sistema di backup automatico è stato implementato per garantire la persistenza dei dati relativi ai conteggi di daimoku. Ogni volta che viene aggiunto un nuovo conteggio, il sistema crea automaticamente un backup di tutti i log in formato JSON.

## Funzionalità

- **Backup automatico**: Ogni volta che viene aggiunto un nuovo conteggio di daimoku, viene creato automaticamente un backup
- **Gestione dei backup vecchi**: Il sistema mantiene solo un numero limitato di backup (default: 10), eliminando automaticamente i più vecchi
- **Backup manuali**: È possibile creare backup manuali tramite API
- **Filtraggio per data**: È possibile creare backup filtrati per data
- **Esportazione**: I backup possono essere scaricati in formato JSON
- **Gestione dei backup**: È possibile visualizzare, scaricare ed eliminare i backup tramite API

## Implementazione

Il sistema di backup è implementato nel servizio `BackupService` e integrato nel controller `CounterController`. Ogni volta che viene chiamato il metodo `incrementCount`, viene avviato un processo asincrono per creare un backup.

### Processo di backup

1. Quando viene aggiunto un nuovo conteggio di daimoku, il controller chiama il metodo `triggerAutomaticBackup`
2. Il metodo `triggerAutomaticBackup` chiama in modo asincrono il servizio `backupService.backupDaimokuLogs`
3. Il servizio `backupService.backupDaimokuLogs` ottiene tutti i log dal database
4. I log vengono salvati in un file JSON nella directory `./backups`
5. Il sistema verifica se ci sono troppi backup e, in caso affermativo, elimina i più vecchi

### Gestione dei backup vecchi

Per evitare che la directory dei backup diventi troppo grande, il sistema mantiene solo un numero limitato di backup (default: 10). Quando viene creato un nuovo backup, il sistema:

1. Ottiene la lista di tutti i backup disponibili
2. Ordina i backup per data (dal più vecchio al più recente)
3. Se il numero di backup supera il limite, elimina i più vecchi

## API

### Backup automatico

Il backup automatico viene eseguito ogni volta che viene aggiunto un nuovo conteggio di daimoku. Non è necessario chiamare API specifiche.

### Backup manuale

#### POST /api/backup/daimoku-logs

Crea un backup manuale dei log di daimoku.

**Parametri**:

| Nome      | Tipo   | Descrizione                                      | Obbligatorio |
|-----------|--------|--------------------------------------------------|--------------| 
| startDate | string | Data di inizio per filtrare i log (ISO 8601)     | No           |
| endDate   | string | Data di fine per filtrare i log (ISO 8601)       | No           |

**Risposta**:

```json
{
  "success": true,
  "message": "Backup created successfully",
  "filePath": "./backups/daimoku_logs_2023-06-15T10-30-00.000Z.json"
}
```

### Gestione dei backup

#### GET /api/backup

Ottiene la lista dei backup disponibili.

**Parametri**: Nessuno

**Risposta**:

```json
{
  "backups": [
    "daimoku_logs_2023-06-15T10-30-00.000Z.json",
    "daimoku_logs_2023-06-16T10-30-00.000Z.json"
  ]
}
```

#### GET /api/backup/:fileName

Scarica un backup specifico.

**Parametri**:

| Nome     | Tipo   | Descrizione                                | Obbligatorio |
|----------|--------|--------------------------------------------|--------------| 
| fileName | string | Nome del file di backup                    | Sì           |

**Risposta**: File JSON con il backup.

#### DELETE /api/backup/:fileName

Elimina un backup specifico.

**Parametri**:

| Nome     | Tipo   | Descrizione                                | Obbligatorio |
|----------|--------|--------------------------------------------|--------------| 
| fileName | string | Nome del file di backup                    | Sì           |

**Risposta**:

```json
{
  "success": true
}
```

## Configurazione

### Directory dei backup

Per default, i backup vengono salvati nella directory `./backups` relativa alla directory di esecuzione dell'applicazione. È possibile modificare questa directory nel costruttore del servizio `BackupService`.

### Numero massimo di backup

Per default, il sistema mantiene solo 10 backup, eliminando automaticamente i più vecchi. È possibile modificare questo valore nel parametro `maxBackups` del metodo `backupDaimokuLogs`.

## Troubleshooting

### I backup non vengono creati

Verificare che:

1. La directory `./backups` esista e sia scrivibile
2. L'applicazione abbia i permessi necessari per creare file nella directory
3. Ci sia spazio sufficiente sul disco

### I backup vecchi non vengono eliminati

Verificare che:

1. Il parametro `maxBackups` sia impostato correttamente
2. L'applicazione abbia i permessi necessari per eliminare file nella directory
3. I nomi dei file di backup seguano il formato corretto (`daimoku_logs_YYYY-MM-DDTHH-MM-SS.SSSZ.json`)
