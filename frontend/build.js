// Script di build personalizzato per Vercel
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Ottieni il percorso corrente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Avvio del processo di build personalizzato');

// Verifica se la directory node_modules esiste
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('📦 Installazione delle dipendenze...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
}

// Esegui la build
try {
  console.log('🔨 Esecuzione della build...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('✅ Build completata con successo!');
} catch (error) {
  console.error('❌ Errore durante la build:', error.message);
  process.exit(1);
}

// Verifica se la directory dist esiste
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  console.error('❌ La directory dist non è stata creata. La build è fallita.');
  process.exit(1);
}

console.log('📋 Contenuto della directory dist:');
const distFiles = fs.readdirSync(path.join(__dirname, 'dist'));
console.log(distFiles);

console.log('🎉 Processo di build completato con successo!');
