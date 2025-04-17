# Sistema di Backup per i Log di Daimoku

Questo sistema di backup è integrato nel progetto principale e permette di salvare automaticamente i log di daimoku in file JSON locali.

## Caratteristiche

- Backup completo di tutti i log di daimoku
- Backup automatici ogni ora tramite cronjob
- Gestione automatica dei backup vecchi (mantiene gli ultimi 30)
- Salvataggio nel repository Git per maggiore sicurezza

## Configurazione

Per configurare il backup automatico:

```bash
# Rendi lo script eseguibile
chmod +x backend/scripts/setup-cron.sh

# Esegui lo script di configurazione
bash backend/scripts/setup-cron.sh
```

Questo configurerà un cronjob che eseguirà il backup ogni ora e salverà i log in `backend/backups/backup.log`.

## Backup manuale

Per eseguire un backup manuale:

```bash
node backend/scripts/backup.js
```

## Dove vengono salvati i backup?

I backup vengono salvati nella directory:

```
backend/backups/
```

Ogni backup è un file JSON con il formato:

```
daimoku_logs_YYYY-MM-DDTHH-MM-SS.SSSZ.json
```

## Struttura del backup

Ogni file di backup contiene:

- Timestamp del backup
- Statistiche sui log (totale minuti, ore, conteggi di successo/errore)
- Numero totale di log
- Tutti i log di daimoku

## Gestione dei backup

Per default, il sistema mantiene gli ultimi 30 backup. Puoi modificare questo valore nel file `backup.js` cambiando il valore di `config.maxBackups`.

## Verifica del cronjob

Per verificare che il cronjob sia configurato correttamente:

```bash
crontab -l
```

Dovresti vedere una riga simile a:

```
0 * * * * node /percorso/al/progetto/backend/scripts/backup.js >> /percorso/al/progetto/backend/backups/backup.log 2>&1
```

## Rimozione del cronjob

Se vuoi rimuovere il cronjob:

```bash
crontab -l | grep -v "backup.js" | crontab -
```
