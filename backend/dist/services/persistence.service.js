"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistenceService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Ottieni il percorso corrente
const __dirname = path_1.default.resolve();
// Percorso del file di persistenza
const DATA_FILE = process.env.DATA_FILE || path_1.default.join(__dirname, '../../data/db.json');
// Assicurati che la directory esista
const dataDir = path_1.default.dirname(DATA_FILE);
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
// Dati di default
const defaultData = {
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
    constructor() {
        this.data = this.loadData();
    }
    /**
     * Carica i dati dal file
     * @returns I dati caricati
     */
    loadData() {
        try {
            if (fs_1.default.existsSync(DATA_FILE)) {
                const fileContent = fs_1.default.readFileSync(DATA_FILE, 'utf-8');
                return JSON.parse(fileContent);
            }
        }
        catch (error) {
            console.error('Error loading data:', error);
        }
        // Se il file non esiste o c'è un errore, restituisci i dati di default
        return { ...defaultData };
    }
    /**
     * Salva i dati nel file
     */
    saveData() {
        try {
            fs_1.default.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
        }
        catch (error) {
            console.error('Error saving data:', error);
        }
    }
    /**
     * Ottiene i dati
     * @returns I dati
     */
    getData() {
        return this.data;
    }
    /**
     * Aggiorna il contatore
     * @param counter Il nuovo valore del contatore
     */
    updateCounter(counter) {
        this.data.counter = counter;
        this.saveData();
    }
    /**
     * Aggiorna il messaggio
     * @param message Il nuovo messaggio
     * @param addToHistory Se aggiungere il messaggio precedente alla cronologia
     */
    updateMessage(message, addToHistory = true) {
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
exports.persistenceService = new PersistenceService();
