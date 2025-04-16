import { Request, Response } from 'express';
import { messageController } from '../../controllers/message.controller';
import { dbService } from '../../services/db.service';
import { Message } from '../../services/db.service';

// Mock del servizio DB
jest.mock('../../services/db.service', () => ({
  dbService: {
    getMessage: jest.fn(),
    updateMessage: jest.fn(),
    getMessageHistory: jest.fn(),
    authenticateUser: jest.fn()
  }
}));

describe('MessageController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Reset dei mock
    jest.clearAllMocks();

    // Mock di req e res
    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    req = {};
    res = {
      json: jsonMock,
      status: statusMock
    };
  });

  describe('getMessage', () => {
    it('dovrebbe restituire il messaggio attuale', () => {
      // Configura il mock
      const mockMessage: Message = {
        content: 'Test content',
        htmlContent: '<p>Test content</p>',
        fullContent: '<div>Test full content</div>',
        objectivesContent: '<li>Test objective</li>'
      };
      (dbService.getMessage as jest.Mock).mockReturnValue(mockMessage);

      // Chiama il controller
      messageController.getMessage(req as Request, res as Response);

      // Verifica che il servizio sia stato chiamato
      expect(dbService.getMessage).toHaveBeenCalled();

      // Verifica la risposta
      expect(res.json).toHaveBeenCalledWith({ message: mockMessage });
    });

    it('dovrebbe gestire gli errori', () => {
      // Configura il mock per lanciare un errore
      (dbService.getMessage as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      // Spia console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Chiama il controller
      messageController.getMessage(req as Request, res as Response);

      // Verifica che l'errore sia stato gestito
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });

      // Ripristina console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateMessage', () => {
    it('dovrebbe aggiornare il messaggio se l\'utente è autenticato', () => {
      // Configura il mock per l'autenticazione
      (dbService.authenticateUser as jest.Mock).mockReturnValue({ id: 1, username: 'admin' });

      // Configura il mock per l'aggiornamento del messaggio
      const mockUpdatedMessage: Message = {
        content: 'Updated content',
        htmlContent: '<p>Updated content</p>',
        fullContent: '<div>Updated full content</div>',
        objectivesContent: '<li>Updated objective</li>'
      };
      (dbService.updateMessage as jest.Mock).mockReturnValue(mockUpdatedMessage);

      // Configura la richiesta
      req.body = {
        content: 'Updated content',
        htmlContent: '<p>Updated content</p>',
        fullContent: '<div>Updated full content</div>',
        objectivesContent: '<li>Updated objective</li>',
        username: 'admin',
        password: 'vesuvio2025'
      };

      // Chiama il controller
      messageController.updateMessage(req as Request, res as Response);

      // Verifica che il servizio di autenticazione sia stato chiamato
      expect(dbService.authenticateUser).toHaveBeenCalledWith('admin', 'vesuvio2025');

      // Verifica che il servizio di aggiornamento sia stato chiamato
      expect(dbService.updateMessage).toHaveBeenCalledWith(
        'Updated content',
        '<p>Updated content</p>',
        '<div>Updated full content</div>',
        '<li>Updated objective</li>'
      );

      // Verifica la risposta
      expect(res.json).toHaveBeenCalledWith({ message: mockUpdatedMessage });
    });

    it('dovrebbe restituire un errore 401 se l\'utente non è autenticato', () => {
      // Configura il mock per l'autenticazione fallita
      (dbService.authenticateUser as jest.Mock).mockReturnValue(null);

      // Configura la richiesta
      req.body = {
        content: 'Updated content',
        htmlContent: '<p>Updated content</p>',
        fullContent: '<div>Updated full content</div>',
        objectivesContent: '<li>Updated objective</li>',
        username: 'admin',
        password: 'wrong-password'
      };

      // Chiama il controller
      messageController.updateMessage(req as Request, res as Response);

      // Verifica che il servizio di autenticazione sia stato chiamato
      expect(dbService.authenticateUser).toHaveBeenCalledWith('admin', 'wrong-password');

      // Verifica che il servizio di aggiornamento NON sia stato chiamato
      expect(dbService.updateMessage).not.toHaveBeenCalled();

      // Verifica la risposta
      expect(res.status).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('dovrebbe restituire un errore 400 se mancano campi obbligatori', () => {
      // Configura il mock per l'autenticazione
      (dbService.authenticateUser as jest.Mock).mockReturnValue({ id: 1, username: 'admin' });

      // Configura la richiesta con campi mancanti
      req.body = {
        content: 'Updated content',
        // htmlContent mancante
        fullContent: '<div>Updated full content</div>',
        objectivesContent: '<li>Updated objective</li>',
        username: 'admin',
        password: 'vesuvio2025'
      };

      // Chiama il controller
      messageController.updateMessage(req as Request, res as Response);

      // Verifica che il servizio di autenticazione sia stato chiamato
      expect(dbService.authenticateUser).toHaveBeenCalledWith('admin', 'vesuvio2025');

      // Verifica che il servizio di aggiornamento NON sia stato chiamato
      expect(dbService.updateMessage).not.toHaveBeenCalled();

      // Verifica la risposta
      expect(res.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Content, HTML content, full content, and objectives content are required' });
    });

    it('dovrebbe gestire gli errori', () => {
      // Configura il mock per l'autenticazione
      (dbService.authenticateUser as jest.Mock).mockReturnValue({ id: 1, username: 'admin' });

      // Configura il mock per lanciare un errore
      (dbService.updateMessage as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      // Configura la richiesta
      req.body = {
        content: 'Updated content',
        htmlContent: '<p>Updated content</p>',
        fullContent: '<div>Updated full content</div>',
        objectivesContent: '<li>Updated objective</li>',
        username: 'admin',
        password: 'vesuvio2025'
      };

      // Spia console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Chiama il controller
      messageController.updateMessage(req as Request, res as Response);

      // Verifica che l'errore sia stato gestito
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });

      // Ripristina console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getMessageHistory', () => {
    it('dovrebbe restituire la cronologia dei messaggi', () => {
      // Configura il mock
      const mockHistory = [
        {
          id: 1,
          content: 'Message 1',
          html_content: '<p>Message 1</p>',
          full_content: '<div>Message 1</div>',
          objectives_content: '<li>Objective 1</li>',
          created_at: '2023-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          content: 'Message 2',
          html_content: '<p>Message 2</p>',
          full_content: '<div>Message 2</div>',
          objectives_content: '<li>Objective 2</li>',
          created_at: '2023-01-02T00:00:00.000Z'
        }
      ];
      (dbService.getMessageHistory as jest.Mock).mockReturnValue(mockHistory);

      // Configura la richiesta
      req.query = {};

      // Chiama il controller
      messageController.getMessageHistory(req as Request, res as Response);

      // Verifica che il servizio sia stato chiamato con il limite predefinito
      expect(dbService.getMessageHistory).toHaveBeenCalledWith(10);

      // Verifica la risposta
      expect(res.json).toHaveBeenCalledWith({ history: mockHistory });
    });

    it('dovrebbe limitare la cronologia al numero specificato', () => {
      // Configura il mock
      const mockHistory = [
        {
          id: 1,
          content: 'Message 1',
          html_content: '<p>Message 1</p>',
          full_content: '<div>Message 1</div>',
          objectives_content: '<li>Objective 1</li>',
          created_at: '2023-01-01T00:00:00.000Z'
        }
      ];
      (dbService.getMessageHistory as jest.Mock).mockReturnValue(mockHistory);

      // Configura la richiesta
      req.query = { limit: '1' };

      // Chiama il controller
      messageController.getMessageHistory(req as Request, res as Response);

      // Verifica che il servizio sia stato chiamato con il limite specificato
      expect(dbService.getMessageHistory).toHaveBeenCalledWith(1);

      // Verifica la risposta
      expect(res.json).toHaveBeenCalledWith({ history: mockHistory });
    });

    it('dovrebbe gestire gli errori', () => {
      // Configura il mock per lanciare un errore
      (dbService.getMessageHistory as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      // Configura la richiesta
      req.query = {};

      // Spia console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Chiama il controller
      messageController.getMessageHistory(req as Request, res as Response);

      // Verifica che l'errore sia stato gestito
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });

      // Ripristina console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
