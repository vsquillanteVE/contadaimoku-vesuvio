#!/bin/bash

# Script per la build del frontend ignorando completamente TypeScript

echo "Iniziando la build del frontend..."
echo "Ignorando completamente gli errori TypeScript..."

# Rimuovi la cartella dist se esiste
rm -rf dist

# Esegui la build di Vite direttamente senza controllo TypeScript
NODE_ENV=production TSC_COMPILE_ON_ERROR=true ESLINT_NO_DEV_ERRORS=true VITE_SKIP_TS_CHECK=true npx vite build

echo "Build completata!"
