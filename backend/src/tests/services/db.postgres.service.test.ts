import { Pool } from 'pg';
import { postgresDBService } from '../../services/db.postgres.service';

// Mock del modulo pg
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
  };
  return {
    Pool: jest.fn(() => mockPool),
  };
});

describe('PostgresDBService', () => {
  let pool: any;

  beforeEach(() => {
    // Reset dei mock
    jest.clearAllMocks();
    pool = new Pool();
  });

  describe('initDatabase', () => {
    it('dovrebbe inizializzare il database creando le tabelle necessarie', async () => {
      // Mock delle query per la creazione delle tabelle
      pool.query.mockResolvedValueOnce({}) // CREATE TABLE counter
        .mockResolvedValueOnce({}) // CREATE TABLE message
        .mockResolvedValueOnce({}) // CREATE TABLE message_history
        .mockResolvedValueOnce({}) // CREATE TABLE users
        .mockResolvedValueOnce({ rows: [] }) // SELECT counter
        .mockResolvedValueOnce({}) // INSERT counter
        .mockResolvedValueOnce({ rows: [] }) // SELECT message
        .mockResolvedValueOnce({}) // INSERT message
        .mockResolvedValueOnce({ rows: [] }) // SELECT users
        .mockResolvedValueOnce({}); // INSERT users

      await postgresDBService.initDatabase();

      // Verifica che tutte le query siano state chiamate
      expect(pool.query).toHaveBeenCalledTimes(10);
      
      // Verifica che le query CREATE TABLE siano state chiamate
      expect(pool.query.mock.calls[0][0]).toContain('CREATE TABLE IF NOT EXISTS counter');
      expect(pool.query.mock.calls[1][0]).toContain('CREATE TABLE IF NOT EXISTS message');
      expect(pool.query.mock.calls[2][0]).toContain('CREATE TABLE IF NOT EXISTS message_history');
      expect(pool.query.mock.calls[3][0]).toContain('CREATE TABLE IF NOT EXISTS users');
    });

    it('dovrebbe gestire gli errori durante l\'inizializzazione', async () => {
      // Mock per lanciare un errore
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      // Spia console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(postgresDBService.initDatabase()).rejects.toThrow('Database error');

      // Verifica che l'errore sia stato gestito
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Ripristina console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCount', () => {
    it('dovrebbe restituire il conteggio dal database', async () => {
      // Mock della query
      pool.query.mockResolvedValueOnce({ rows: [{ value: 42 }] });

      const count = await postgresDBService.getCount();

      // Verifica che la query sia stata chiamata correttamente
      expect(pool.query).toHaveBeenCalledWith('SELECT value FROM counter LIMIT 1');
      expect(count).toBe(42);
    });

    it('dovrebbe restituire 0 se non ci sono righe', async () => {
      // Mock della query
      pool.query.mockResolvedValueOnce({ rows: [] });

      const count = await postgresDBService.getCount();

      // Verifica che la query sia stata chiamata correttamente
      expect(pool.query).toHaveBeenCalledWith('SELECT value FROM counter LIMIT 1');
      expect(count).toBe(0);
    });

    it('dovrebbe gestire gli errori', async () => {
      // Mock per lanciare un errore
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      // Spia console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(postgresDBService.getCount()).rejects.toThrow('Database error');

      // Verifica che l'errore sia stato gestito
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Ripristina console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('incrementCount', () => {
    it('dovrebbe incrementare il conteggio di 1 per default', async () => {
      // Mock della query
      pool.query.mockResolvedValueOnce({ rows: [{ value: 43 }] });

      const count = await postgresDBService.incrementCount();

      // Verifica che la query sia stata chiamata correttamente
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE counter SET value = value + $1 RETURNING value',
        [1]
      );
      expect(count).toBe(43);
    });

    it('dovrebbe incrementare il conteggio della quantità specificata', async () => {
      // Mock della query
      pool.query.mockResolvedValueOnce({ rows: [{ value: 47 }] });

      const count = await postgresDBService.incrementCount(5);

      // Verifica che la query sia stata chiamata correttamente
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE counter SET value = value + $1 RETURNING value',
        [5]
      );
      expect(count).toBe(47);
    });

    it('dovrebbe gestire gli errori', async () => {
      // Mock per lanciare un errore
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      // Spia console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(postgresDBService.incrementCount()).rejects.toThrow('Database error');

      // Verifica che l'errore sia stato gestito
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Ripristina console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('resetCount', () => {
    it('dovrebbe resettare il conteggio a 0', async () => {
      // Mock della query
      pool.query.mockResolvedValueOnce({});

      const result = await postgresDBService.resetCount();

      // Verifica che la query sia stata chiamata correttamente
      expect(pool.query).toHaveBeenCalledWith('UPDATE counter SET value = 0');
      expect(result).toBe(true);
    });

    it('dovrebbe gestire gli errori', async () => {
      // Mock per lanciare un errore
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      // Spia console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(postgresDBService.resetCount()).rejects.toThrow('Database error');

      // Verifica che l'errore sia stato gestito
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Ripristina console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getMessage', () => {
    it('dovrebbe restituire il messaggio dal database', async () => {
      // Mock della query
      pool.query.mockResolvedValueOnce({
        rows: [{
          content: 'Test content',
          html_content: '<p>Test content</p>',
          full_content: '<div>Test full content</div>',
          objectives_content: '<li>Test objective</li>'
        }]
      });

      const message = await postgresDBService.getMessage();

      // Verifica che la query sia stata chiamata correttamente
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM message LIMIT 1');
      expect(message).toEqual({
        content: 'Test content',
        htmlContent: '<p>Test content</p>',
        fullContent: '<div>Test full content</div>',
        objectivesContent: '<li>Test objective</li>'
      });
    });

    it('dovrebbe lanciare un errore se non ci sono messaggi', async () => {
      // Mock della query
      pool.query.mockResolvedValueOnce({ rows: [] });

      // Spia console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(postgresDBService.getMessage()).rejects.toThrow('No message found');

      // Verifica che l'errore sia stato gestito
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Ripristina console.error
      consoleErrorSpy.mockRestore();
    });

    it('dovrebbe gestire gli errori', async () => {
      // Mock per lanciare un errore
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      // Spia console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(postgresDBService.getMessage()).rejects.toThrow('Database error');

      // Verifica che l'errore sia stato gestito
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Ripristina console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateMessage', () => {
    it('dovrebbe aggiornare il messaggio e restituire il messaggio aggiornato', async () => {
      // Mock delle query
      pool.query
        .mockResolvedValueOnce({ // getMessage
          rows: [{
            content: 'Old content',
            html_content: '<p>Old content</p>',
            full_content: '<div>Old full content</div>',
            objectives_content: '<li>Old objective</li>'
          }]
        })
        .mockResolvedValueOnce({}) // INSERT message_history
        .mockResolvedValueOnce({}); // UPDATE message

      const content = 'New content';
      const htmlContent = '<p>New content</p>';
      const fullContent = '<div>New full content</div>';
      const objectivesContent = '<li>New objective</li>';

      const message = await postgresDBService.updateMessage(content, htmlContent, fullContent, objectivesContent);

      // Verifica che le query siano state chiamate correttamente
      expect(pool.query).toHaveBeenCalledTimes(3);
      expect(pool.query.mock.calls[1][0]).toContain('INSERT INTO message_history');
      expect(pool.query.mock.calls[2][0]).toContain('UPDATE message');
      expect(message).toEqual({
        content,
        htmlContent,
        fullContent,
        objectivesContent
      });
    });

    it('dovrebbe gestire gli errori', async () => {
      // Mock per lanciare un errore
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      // Spia console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const content = 'New content';
      const htmlContent = '<p>New content</p>';
      const fullContent = '<div>New full content</div>';
      const objectivesContent = '<li>New objective</li>';

      await expect(postgresDBService.updateMessage(content, htmlContent, fullContent, objectivesContent)).rejects.toThrow('Database error');

      // Verifica che l'errore sia stato gestito
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Ripristina console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getMessageHistory', () => {
    it('dovrebbe restituire la cronologia dei messaggi', async () => {
      // Mock della query
      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            content: 'Message 1',
            html_content: '<p>Message 1</p>',
            full_content: '<div>Message 1</div>',
            objectives_content: '<li>Objective 1</li>',
            created_at: new Date('2023-01-01')
          },
          {
            id: 2,
            content: 'Message 2',
            html_content: '<p>Message 2</p>',
            full_content: '<div>Message 2</div>',
            objectives_content: '<li>Objective 2</li>',
            created_at: new Date('2023-01-02')
          }
        ]
      });

      const history = await postgresDBService.getMessageHistory();

      // Verifica che la query sia stata chiamata correttamente
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM message_history'),
        [10]
      );
      expect(history).toHaveLength(2);
      expect(history[0]).toHaveProperty('id', 1);
      expect(history[0]).toHaveProperty('content', 'Message 1');
      expect(history[0]).toHaveProperty('created_at', new Date('2023-01-01').toISOString());
    });

    it('dovrebbe limitare la cronologia al numero specificato', async () => {
      // Mock della query
      pool.query.mockResolvedValueOnce({ rows: [] });

      await postgresDBService.getMessageHistory(5);

      // Verifica che la query sia stata chiamata correttamente
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM message_history'),
        [5]
      );
    });

    it('dovrebbe gestire gli errori', async () => {
      // Mock per lanciare un errore
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      // Spia console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(postgresDBService.getMessageHistory()).rejects.toThrow('Database error');

      // Verifica che l'errore sia stato gestito
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Ripristina console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('authenticateUser', () => {
    it('dovrebbe autenticare un utente con credenziali valide', async () => {
      // Mock della query
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          username: 'admin',
          password: 'vesuvio2025'
        }]
      });

      const user = await postgresDBService.authenticateUser('admin', 'vesuvio2025');

      // Verifica che la query sia stata chiamata correttamente
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users'),
        ['admin', 'vesuvio2025']
      );
      expect(user).toEqual({
        id: 1,
        username: 'admin',
        password: 'vesuvio2025'
      });
    });

    it('dovrebbe restituire null per credenziali non valide', async () => {
      // Mock della query
      pool.query.mockResolvedValueOnce({ rows: [] });

      const user = await postgresDBService.authenticateUser('admin', 'wrong-password');

      // Verifica che la query sia stata chiamata correttamente
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users'),
        ['admin', 'wrong-password']
      );
      expect(user).toBeNull();
    });

    it('dovrebbe gestire gli errori', async () => {
      // Mock per lanciare un errore
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      // Spia console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(postgresDBService.authenticateUser('admin', 'vesuvio2025')).rejects.toThrow('Database error');

      // Verifica che l'errore sia stato gestito
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Ripristina console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
