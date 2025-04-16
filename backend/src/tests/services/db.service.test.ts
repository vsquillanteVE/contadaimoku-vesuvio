import { dbService } from '../../services/db.service';

describe('DBService', () => {
  // Reset del conteggio prima di ogni test
  beforeEach(() => {
    dbService.resetCount();
  });

  describe('getCount', () => {
    it('dovrebbe restituire il conteggio attuale', () => {
      expect(dbService.getCount()).toBe(0);
    });
  });

  describe('incrementCount', () => {
    it('dovrebbe incrementare il conteggio di 1 per default', () => {
      const newCount = dbService.incrementCount();
      expect(newCount).toBe(1);
      expect(dbService.getCount()).toBe(1);
    });

    it('dovrebbe incrementare il conteggio della quantità specificata', () => {
      const newCount = dbService.incrementCount(5);
      expect(newCount).toBe(5);
      expect(dbService.getCount()).toBe(5);
    });
  });

  describe('resetCount', () => {
    it('dovrebbe resettare il conteggio a 0', () => {
      dbService.incrementCount(10);
      expect(dbService.getCount()).toBe(10);
      
      const result = dbService.resetCount();
      expect(result).toBe(true);
      expect(dbService.getCount()).toBe(0);
    });
  });

  describe('getMessage', () => {
    it('dovrebbe restituire il messaggio attuale', () => {
      const message = dbService.getMessage();
      expect(message).toHaveProperty('content');
      expect(message).toHaveProperty('htmlContent');
      expect(message).toHaveProperty('fullContent');
      expect(message).toHaveProperty('objectivesContent');
    });
  });

  describe('updateMessage', () => {
    it('dovrebbe aggiornare il messaggio e restituire il messaggio aggiornato', () => {
      const content = 'Nuovo messaggio';
      const htmlContent = '<p>Nuovo messaggio</p>';
      const fullContent = '<div>Nuovo messaggio completo</div>';
      const objectivesContent = '<li>Nuovo obiettivo</li>';

      const updatedMessage = dbService.updateMessage(content, htmlContent, fullContent, objectivesContent);

      expect(updatedMessage.content).toBe(content);
      expect(updatedMessage.htmlContent).toBe(htmlContent);
      expect(updatedMessage.fullContent).toBe(fullContent);
      expect(updatedMessage.objectivesContent).toBe(objectivesContent);

      // Verifica che il messaggio sia stato effettivamente aggiornato
      const currentMessage = dbService.getMessage();
      expect(currentMessage).toEqual(updatedMessage);
    });

    it('dovrebbe aggiungere il messaggio precedente alla cronologia', () => {
      // Ottieni il messaggio attuale
      const originalMessage = dbService.getMessage();

      // Aggiorna il messaggio
      const content = 'Messaggio aggiornato';
      const htmlContent = '<p>Messaggio aggiornato</p>';
      const fullContent = '<div>Messaggio completo aggiornato</div>';
      const objectivesContent = '<li>Obiettivo aggiornato</li>';

      dbService.updateMessage(content, htmlContent, fullContent, objectivesContent);

      // Ottieni la cronologia
      const history = dbService.getMessageHistory();

      // Verifica che il messaggio originale sia nella cronologia
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].content).toBe(originalMessage.content);
      expect(history[history.length - 1].html_content).toBe(originalMessage.htmlContent);
      expect(history[history.length - 1].full_content).toBe(originalMessage.fullContent);
      expect(history[history.length - 1].objectives_content).toBe(originalMessage.objectivesContent);
    });
  });

  describe('getMessageHistory', () => {
    it('dovrebbe restituire la cronologia dei messaggi', () => {
      // Aggiorna il messaggio alcune volte per creare una cronologia
      dbService.updateMessage('Messaggio 1', '<p>Messaggio 1</p>', '<div>Messaggio 1</div>', '<li>Obiettivo 1</li>');
      dbService.updateMessage('Messaggio 2', '<p>Messaggio 2</p>', '<div>Messaggio 2</div>', '<li>Obiettivo 2</li>');
      dbService.updateMessage('Messaggio 3', '<p>Messaggio 3</p>', '<div>Messaggio 3</div>', '<li>Obiettivo 3</li>');

      const history = dbService.getMessageHistory();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThanOrEqual(3);
    });

    it('dovrebbe limitare la cronologia al numero specificato', () => {
      // Aggiorna il messaggio alcune volte per creare una cronologia
      dbService.updateMessage('Messaggio 1', '<p>Messaggio 1</p>', '<div>Messaggio 1</div>', '<li>Obiettivo 1</li>');
      dbService.updateMessage('Messaggio 2', '<p>Messaggio 2</p>', '<div>Messaggio 2</div>', '<li>Obiettivo 2</li>');
      dbService.updateMessage('Messaggio 3', '<p>Messaggio 3</p>', '<div>Messaggio 3</div>', '<li>Obiettivo 3</li>');
      dbService.updateMessage('Messaggio 4', '<p>Messaggio 4</p>', '<div>Messaggio 4</div>', '<li>Obiettivo 4</li>');
      dbService.updateMessage('Messaggio 5', '<p>Messaggio 5</p>', '<div>Messaggio 5</div>', '<li>Obiettivo 5</li>');

      const history = dbService.getMessageHistory(2);
      expect(history.length).toBe(2);
    });
  });

  describe('authenticateUser', () => {
    it('dovrebbe autenticare un utente con credenziali valide', () => {
      const user = dbService.authenticateUser('admin', 'vesuvio2025');
      expect(user).not.toBeNull();
      expect(user?.username).toBe('admin');
    });

    it('dovrebbe restituire null per credenziali non valide', () => {
      const user = dbService.authenticateUser('admin', 'password-errata');
      expect(user).toBeNull();
    });

    it('dovrebbe restituire null per un utente inesistente', () => {
      const user = dbService.authenticateUser('utente-inesistente', 'password');
      expect(user).toBeNull();
    });
  });
});
