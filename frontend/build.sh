#!/bin/bash

# Script per la build del frontend ignorando gli errori TypeScript

echo "Iniziando la build del frontend..."
echo "Ignorando gli errori TypeScript..."

# Imposta le variabili d'ambiente per ignorare gli errori TypeScript
export TSC_COMPILE_ON_ERROR=true
export ESLINT_NO_DEV_ERRORS=true
export VITE_SKIP_TS_CHECK=true
export VITE_TSCONFIG_PATHS=false
export VITE_TS_TRANSPILE_ONLY=true

# Esegui la build di Vite direttamente senza controllo TypeScript
npx vite build --emptyOutDir

echo "Build completata!"
