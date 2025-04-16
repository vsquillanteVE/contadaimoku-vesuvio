import request from 'supertest';
import app from '../../index';
import { dbService } from '../../services/db.service';

describe('Backend End-to-End Tests', () => {
  // Reset del conteggio prima di ogni test
  beforeEach(() => {
    dbService.resetCount();
  });

  describe('Flusso completo di autenticazione e aggiornamento del messaggio', () => {
    it('dovrebbe autenticare un utente e permettergli di aggiornare il messaggio', async () => {
      // 1. Autenticazione
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'vesuvio2025' });
      
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('user');
      expect(loginResponse.body.user).toHaveProperty('username', 'admin');

      // 2. Ottieni il messaggio corrente
      const getMessageResponse = await request(app).get('/api/message');
      
      expect(getMessageResponse.status).toBe(200);
      expect(getMessageResponse.body).toHaveProperty('message');

      // 3. Aggiorna il messaggio
      const updateMessageResponse = await request(app)
        .post('/api/message')
        .send({
          content: 'E2E Test Message',
          htmlContent: '<p>E2E Test Message</p>',
          fullContent: '<div>E2E Test Full Content</div>',
          objectivesContent: '<li>E2E Test Objective</li>',
          username: 'admin',
          password: 'vesuvio2025'
        });
      
      expect(updateMessageResponse.status).toBe(200);
      expect(updateMessageResponse.body).toHaveProperty('message');
      expect(updateMessageResponse.body.message).toHaveProperty('content', 'E2E Test Message');

      // 4. Verifica che il messaggio sia stato aggiornato
      const getUpdatedMessageResponse = await request(app).get('/api/message');
      
      expect(getUpdatedMessageResponse.status).toBe(200);
      expect(getUpdatedMessageResponse.body).toHaveProperty('message');
      expect(getUpdatedMessageResponse.body.message).toHaveProperty('content', 'E2E Test Message');

      // 5. Verifica che il messaggio precedente sia nella cronologia
      const getHistoryResponse = await request(app).get('/api/message/history');
      
      expect(getHistoryResponse.status).toBe(200);
      expect(getHistoryResponse.body).toHaveProperty('history');
      expect(Array.isArray(getHistoryResponse.body.history)).toBe(true);
      expect(getHistoryResponse.body.history.length).toBeGreaterThan(0);
    });
  });

  describe('Flusso completo di incremento del contatore', () => {
    it('dovrebbe incrementare il contatore e restituire il valore aggiornato', async () => {
      // 1. Ottieni il conteggio iniziale
      const getCountResponse = await request(app).get('/api/count');
      
      expect(getCountResponse.status).toBe(200);
      expect(getCountResponse.body).toHaveProperty('count', 0);

      // 2. Incrementa il conteggio
      const incrementResponse = await request(app).post('/api/count').send({ amount: 5 });
      
      expect(incrementResponse.status).toBe(200);
      expect(incrementResponse.body).toHaveProperty('count', 5);

      // 3. Verifica che il conteggio sia stato aggiornato
      const getUpdatedCountResponse = await request(app).get('/api/count');
      
      expect(getUpdatedCountResponse.status).toBe(200);
      expect(getUpdatedCountResponse.body).toHaveProperty('count', 5);

      // 4. Resetta il conteggio
      const resetResponse = await request(app).post('/api/count/reset');
      
      expect(resetResponse.status).toBe(200);
      expect(resetResponse.body).toHaveProperty('success', true);

      // 5. Verifica che il conteggio sia stato resettato
      const getResetCountResponse = await request(app).get('/api/count');
      
      expect(getResetCountResponse.status).toBe(200);
      expect(getResetCountResponse.body).toHaveProperty('count', 0);
    });
  });

  describe('Gestione degli errori', () => {
    it('dovrebbe gestire richieste a endpoint non esistenti', async () => {
      const response = await request(app).get('/api/non-existent-endpoint');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Endpoint non trovato');
    });

    it('dovrebbe gestire errori di autenticazione', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrong-password' });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('dovrebbe gestire errori di validazione', async () => {
      const response = await request(app)
        .post('/api/message')
        .send({
          // Mancano campi obbligatori
          content: 'Test content',
          username: 'admin',
          password: 'vesuvio2025'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Content, HTML content, full content, and objectives content are required');
    });
  });
});
