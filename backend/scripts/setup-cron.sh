#!/bin/bash

# Script per configurare il cronjob di backup orario

# Vai alla directory dello script
cd "$(dirname "$0")"

# Percorso assoluto allo script di backup
SCRIPT_PATH="$(pwd)/backup.js"
LOG_PATH="$(pwd)/../backups/backup.log"

# Crea la directory dei log se non esiste
mkdir -p "$(pwd)/../backups"

echo "Configurazione del cronjob di backup orario..."

# Crea un file temporaneo con il crontab attuale
crontab -l > /tmp/current_crontab 2>/dev/null || echo "" > /tmp/current_crontab

# Verifica se il cronjob è già configurato
if grep -q "$SCRIPT_PATH" /tmp/current_crontab; then
  echo "Il cronjob è già configurato."
else
  # Aggiungi il job di backup al crontab (ogni ora)
  echo "0 * * * * node $SCRIPT_PATH >> $LOG_PATH 2>&1" >> /tmp/current_crontab
  
  # Installa il nuovo crontab
  crontab /tmp/current_crontab
  
  echo "Cronjob configurato con successo!"
fi

# Rimuovi il file temporaneo
rm /tmp/current_crontab

echo "Il backup verrà eseguito ogni ora."
echo "I log del backup saranno salvati in $LOG_PATH"

# Esegui un backup iniziale
echo "Esecuzione di un backup iniziale..."
node "$SCRIPT_PATH"
