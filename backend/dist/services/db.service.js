"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbService = void 0;
// Importa il servizio PostgreSQL
const db_postgres_service_1 = require("./db.postgres.service");
/**
 * Classe per gestire le operazioni sul database
 */
class DBService {
    /**
     * Ottiene il conteggio attuale
     * @returns Il conteggio attuale
     */
    async getCount() {
        return db_postgres_service_1.postgresDBService.getCount();
    }
    /**
     * Incrementa il conteggio
     * @param amount Quantità da incrementare (default: 1)
     * @param clientInfo Informazioni sul client (opzionale)
     * @returns Il nuovo conteggio
     */
    async incrementCount(amount = 1, clientInfo = '') {
        return db_postgres_service_1.postgresDBService.incrementCount(amount, clientInfo);
    }
    /**
     * Resetta il conteggio a 0
     * @returns true se l'operazione è riuscita
     */
    async resetCount() {
        return db_postgres_service_1.postgresDBService.resetCount();
    }
    /**
     * Ottiene il messaggio attuale
     * @returns Il messaggio attuale
     */
    async getMessage() {
        return db_postgres_service_1.postgresDBService.getMessage();
    }
    /**
     * Aggiorna il messaggio
     * @param content Contenuto del messaggio
     * @param htmlContent Contenuto HTML del messaggio
     * @param fullContent Contenuto completo del messaggio
     * @param objectivesContent Contenuto degli obiettivi
     * @returns Il messaggio aggiornato
     */
    async updateMessage(content, htmlContent, fullContent, objectivesContent) {
        return db_postgres_service_1.postgresDBService.updateMessage(content, htmlContent, fullContent, objectivesContent);
    }
    /**
     * Ottiene la cronologia dei messaggi
     * @param limit Numero massimo di messaggi da restituire (default: 10)
     * @returns La cronologia dei messaggi
     */
    async getMessageHistory(limit = 10) {
        return db_postgres_service_1.postgresDBService.getMessageHistory(limit);
    }
    /**
     * Autentica un utente
     * @param username Nome utente
     * @param password Password
     * @returns L'utente autenticato o null se l'autenticazione fallisce
     */
    async authenticateUser(username, password) {
        return db_postgres_service_1.postgresDBService.authenticateUser(username, password);
    }
    /**
     * Ottiene la cronologia dei log di daimoku
     * @param limit Numero massimo di log da restituire (default: 100)
     * @param offset Offset per la paginazione (default: 0)
     * @returns La cronologia dei log di daimoku
     */
    async getDaimokuLogs(limit = 100, offset = 0) {
        return db_postgres_service_1.postgresDBService.getDaimokuLogs(limit, offset);
    }
    /**
     * Ottiene statistiche sui log di daimoku
     * @returns Statistiche sui log di daimoku
     */
    async getDaimokuStats() {
        return db_postgres_service_1.postgresDBService.getDaimokuStats();
    }
}
// Esporta un'istanza singleton del servizio
exports.dbService = new DBService();
