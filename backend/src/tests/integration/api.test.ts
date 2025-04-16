import request from 'supertest';
import app from '../../index';
import { dbService } from '../../services/db.service';

describe('API Integration Tests', () => {
  // Reset del conteggio prima di ogni test
  beforeEach(() => {
    dbService.resetCount();
  });

  describe('GET /api/test', () => {
    it('dovrebbe restituire un messaggio di test', async () => {
      const response = await request(app).get('/api/test');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'API is working!');
      expect(response.body).toHaveProperty('env');
      expect(response.body).toHaveProperty('vercel');
    });
  });

  describe('GET /api/count', () => {
    it('dovrebbe restituire il conteggio attuale', async () => {
      const response = await request(app).get('/api/count');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count', 0);
    });
  });

  describe('POST /api/count', () => {
    it('dovrebbe incrementare il conteggio di 1 per default', async () => {
      const response = await request(app).post('/api/count').send({});
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count', 1);
    });

    it('dovrebbe incrementare il conteggio della quantità specificata', async () => {
      const response = await request(app).post('/api/count').send({ amount: 5 });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count', 5);
    });
  });

  describe('GET /api/message', () => {
    it('dovrebbe restituire il messaggio attuale', async () => {
      const response = await request(app).get('/api/message');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toHaveProperty('content');
      expect(response.body.message).toHaveProperty('htmlContent');
      expect(response.body.message).toHaveProperty('fullContent');
      expect(response.body.message).toHaveProperty('objectivesContent');
    });
  });

  describe('POST /api/auth/login', () => {
    it('dovrebbe autenticare un utente con credenziali valide', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'vesuvio2025' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('username', 'admin');
    });

    it('dovrebbe restituire un errore 401 per credenziali non valide', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrong-password' });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('dovrebbe restituire un errore 400 se mancano campi obbligatori', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin' }); // password mancante
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Username and password are required');
    });
  });

  describe('POST /api/message', () => {
    it('dovrebbe aggiornare il messaggio se l\'utente è autenticato', async () => {
      const response = await request(app)
        .post('/api/message')
        .send({
          content: 'Updated content',
          htmlContent: '<p>Updated content</p>',
          fullContent: '<div>Updated full content</div>',
          objectivesContent: '<li>Updated objective</li>',
          username: 'admin',
          password: 'vesuvio2025'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toHaveProperty('content', 'Updated content');
      expect(response.body.message).toHaveProperty('htmlContent', '<p>Updated content</p>');
      expect(response.body.message).toHaveProperty('fullContent', '<div>Updated full content</div>');
      expect(response.body.message).toHaveProperty('objectivesContent', '<li>Updated objective</li>');
    });

    it('dovrebbe restituire un errore 401 se l\'utente non è autenticato', async () => {
      const response = await request(app)
        .post('/api/message')
        .send({
          content: 'Updated content',
          htmlContent: '<p>Updated content</p>',
          fullContent: '<div>Updated full content</div>',
          objectivesContent: '<li>Updated objective</li>',
          username: 'admin',
          password: 'wrong-password'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('dovrebbe restituire un errore 400 se mancano campi obbligatori', async () => {
      const response = await request(app)
        .post('/api/message')
        .send({
          content: 'Updated content',
          // htmlContent mancante
          fullContent: '<div>Updated full content</div>',
          objectivesContent: '<li>Updated objective</li>',
          username: 'admin',
          password: 'vesuvio2025'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Content, HTML content, full content, and objectives content are required');
    });
  });

  describe('GET /api/message/history', () => {
    it('dovrebbe restituire la cronologia dei messaggi', async () => {
      // Aggiorna il messaggio per creare una cronologia
      await request(app)
        .post('/api/message')
        .send({
          content: 'Message 1',
          htmlContent: '<p>Message 1</p>',
          fullContent: '<div>Message 1</div>',
          objectivesContent: '<li>Objective 1</li>',
          username: 'admin',
          password: 'vesuvio2025'
        });

      const response = await request(app).get('/api/message/history');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('history');
      expect(Array.isArray(response.body.history)).toBe(true);
    });
  });

  describe('404 handler', () => {
    it('dovrebbe gestire le richieste a endpoint non trovati', async () => {
      const response = await request(app).get('/api/non-existent-endpoint');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Endpoint non trovato');
    });
  });
});
