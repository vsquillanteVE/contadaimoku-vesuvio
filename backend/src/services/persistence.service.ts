import fs from 'fs';
import path from 'path';
import { Message, MessageHistoryItem, User } from './db.service';

// Ottieni il percorso corrente
const __dirname = path.resolve();

// Percorso del file di persistenza
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, '../../data/db.json');

// Assicurati che la directory esista
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Interfaccia per i dati persistenti
export interface PersistentData {
  counter: number;
  message: Message;
  messageHistory: MessageHistoryItem[];
  users: User[];
}

// Dati di default
const defaultData: PersistentData = {
  counter: 0,
  message: {
    content: 'Niente può distruggere i tesori del cuore.',
    htmlContent: '<p>Niente può distruggere i tesori del cuore.</p>',
    fullContent: '<div class="message-highlight"><p>Niente può distruggere i tesori del cuore.</p></div>',
    objectivesContent: '<li>Realizziamo in Unità 10.000.000 di Daimoku per la protezione e la buona salute di tutti i praticanti e di tutti i cittadini del Vesuvio</li><li>Studiamo insieme le guide di Sensei</li>'
  },
  messageHistory: [],
  users: [
    { id: 1, username: 'admin', password: 'vesuvio2025' }
  ]
};

/**
 * Classe per gestire la persistenza dei dati
 */
class PersistenceService {
  private data: PersistentData;

  constructor() {
    this.data = this.loadData();
  }

  /**
   * Carica i dati dal file
   * @returns I dati caricati
   */
  private loadData(): PersistentData {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }

    // Se il file non esiste o c'è un errore, restituisci i dati di default
    return { ...defaultData };
  }

  /**
   * Salva i dati nel file
   */
  private saveData(): void {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  /**
   * Ottiene i dati
   * @returns I dati
   */
  getData(): PersistentData {
    return this.data;
  }

  /**
   * Aggiorna il contatore
   * @param counter Il nuovo valore del contatore
   */
  updateCounter(counter: number): void {
    this.data.counter = counter;
    this.saveData();
  }

  /**
   * Aggiorna il messaggio
   * @param message Il nuovo messaggio
   * @param addToHistory Se aggiungere il messaggio precedente alla cronologia
   */
  updateMessage(message: Message, addToHistory: boolean = true): void {
    if (addToHistory) {
      this.data.messageHistory.push({
        id: this.data.messageHistory.length + 1,
        content: this.data.message.content,
        html_content: this.data.message.htmlContent,
        full_content: this.data.message.fullContent,
        objectives_content: this.data.message.objectivesContent,
        created_at: new Date().toISOString()
      });
    }

    this.data.message = message;
    this.saveData();
  }
}

// Esporta un'istanza singleton del servizio
export const persistenceService = new PersistenceService();
