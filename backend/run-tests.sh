#!/bin/bash

# Colori per l'output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Esecuzione dei test dopo la build ===${NC}"

# Verifica se la build è stata completata
if [ ! -d "dist" ]; then
  echo -e "${RED}La directory 'dist' non esiste. Esegui prima 'npm run build'.${NC}"
  exit 1
fi

# Esegui i test
echo -e "${YELLOW}Esecuzione dei test...${NC}"
npm test

# Verifica il risultato dei test
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Tutti i test sono passati!${NC}"
  exit 0
else
  echo -e "${RED}✗ Alcuni test sono falliti. Controlla l'output sopra per i dettagli.${NC}"
  exit 1
fi
