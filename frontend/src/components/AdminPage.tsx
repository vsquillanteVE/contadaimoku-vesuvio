import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import { getMessage, updateMessage, getMessageHistory } from '../services/api';
import { Editor } from '@tinymce/tinymce-react';
import Logo from './Logo';

interface MessageHistory {
  id: number;
  content: string;
  html_content: string;
  full_content?: string;
  objectives_content?: string;
  created_at: string;
}

// Token API di TinyMCE
const TINYMCE_API_KEY = '33wgnmi1idh0idd4g7obb8eqhq8c68y3ce8mn2yh6ld2xiuq';

const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  // Manteniamo queste variabili per compatibilità con l'API
  const [message, setMessage] = useState<string>('');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [fullContent, setFullContent] = useState<string>('');
  const [objectivesContent, setObjectivesContent] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<MessageHistory[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const msg = await getMessage();
        setMessage(msg.content);
        setHtmlContent(msg.htmlContent);
        if (msg.fullContent) {
          setFullContent(msg.fullContent);
        }
        if (msg.objectivesContent) {
          setObjectivesContent(msg.objectivesContent);
        }
      } catch (error) {
        console.error('Error fetching message:', error);
        setStatus('Errore nel caricamento del messaggio');
      }
    };

    fetchMessage();
  }, []);

  const fetchHistory = async () => {
    try {
      const historyData = await getMessageHistory(20);
      setHistory(historyData);
    } catch (error) {
      console.error('Error fetching message history:', error);
      setStatus('Errore nel caricamento della cronologia');
    }
  };

  const handleLoginSuccess = (loggedUsername: string, loggedPassword: string) => {
    console.log('Login success:', loggedUsername);
    setUsername(loggedUsername);
    setPassword(loggedPassword);
    setIsLoggedIn(true);
    fetchHistory();
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const restoreVersion = (content: string, htmlContent: string, fullContent: string, objectivesContent: string) => {
    setMessage(content);
    setHtmlContent(htmlContent);
    setFullContent(fullContent);
    setObjectivesContent(objectivesContent);
    setShowHistory(false);
    setStatus('Versione precedente caricata nell\'editor. Clicca su "Aggiorna Messaggio" per salvare.');
  };

  // Funzione per inserire tag HTML nel textarea degli obiettivi
  const insertTag = (openTag: string, closeTag: string) => {
    const textarea = document.querySelector('.objectives-input') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = objectivesContent.substring(start, end);
    const beforeText = objectivesContent.substring(0, start);
    const afterText = objectivesContent.substring(end);

    const newContent = beforeText + openTag + selectedText + closeTag + afterText;
    setObjectivesContent(newContent);

    // Rimetti il focus sul textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, end + openTag.length);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullContent.trim()) {
      setStatus('Il contenuto della pagina non può essere vuoto');
      return;
    }

    try {
      setLoading(true);
      setStatus('Aggiornamento in corso...');

      // Utilizziamo il contenuto HTML dell'editor WYSIWYG come messaggio in evidenza
      // Estraiamo i primi 100 caratteri per il messaggio in evidenza
      const shortContent = fullContent.replace(/<[^>]*>/g, '').substring(0, 100);
      const shortHtmlContent = `<p>${shortContent}...</p>`;

      const updatedMessage = await updateMessage(shortContent, shortHtmlContent, fullContent, objectivesContent, username, password);
      setMessage(updatedMessage.content);
      setHtmlContent(updatedMessage.htmlContent);
      if (updatedMessage.fullContent) {
        setFullContent(updatedMessage.fullContent);
      }
      if (updatedMessage.objectivesContent) {
        setObjectivesContent(updatedMessage.objectivesContent);
      }
      setStatus('Messaggio aggiornato con successo!');

      // Aggiorna la cronologia
      fetchHistory();
    } catch (error: any) {
      console.error('Error updating message:', error);
      if (error.response && error.response.status === 401) {
        setStatus('Credenziali non valide');
        setIsLoggedIn(false);
      } else {
        setStatus('Errore durante l\'aggiornamento del messaggio');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="admin-container">
      <Logo />
      <h1>Amministrazione</h1>
      <p className="admin-description">
        Benvenuto, {username}! Qui puoi modificare il messaggio principale visualizzato nella home page.
      </p>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="message">Messaggio:</label>
          <div className="editor-container">
            <h3>Modifica gli obiettivi:</h3>
            <div className="formatting-buttons">
              <button type="button" onClick={() => insertTag('<li>', '</li>')} title="Elemento lista">
                • Elemento
              </button>
              <button type="button" onClick={() => insertTag('<b>', '</b>')} title="Grassetto">
                <strong>B</strong>
              </button>
              <button type="button" onClick={() => insertTag('<i>', '</i>')} title="Corsivo">
                <i>I</i>
              </button>
              <button type="button" onClick={() => insertTag('<u>', '</u>')} title="Sottolineato">
                <u>U</u>
              </button>
            </div>
            <textarea
              value={objectivesContent}
              onChange={(e) => setObjectivesContent(e.target.value)}
              className="message-input objectives-input"
              rows={5}
            />
            <p className="help-text">
              Inserisci gli obiettivi come elementi di lista (tag &lt;li&gt;). Questi verranno visualizzati come elenco puntato nella home page.
            </p>

            <h3>Modifica il contenuto della pagina:</h3>
            <div className="wysiwyg-editor">
              <Editor
                apiKey={TINYMCE_API_KEY}
                init={{
                  height: 400,
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                }}
                value={fullContent}
                onEditorChange={(content) => setFullContent(content)}
              />
            </div>
            <p className="help-text">
              Usa l'editor sopra per formattare il contenuto della pagina. Puoi aggiungere titoli, grassetto, corsivo, liste, immagini e link.
            </p>
          </div>
        </div>

        {status && <div className={`status-message ${status.includes('successo') ? 'success' : 'error'}`}>{status}</div>}
        <div className="admin-buttons">
          <button type="button" className="history-button" onClick={toggleHistory}>
            {showHistory ? 'Nascondi Cronologia' : 'Mostra Cronologia'}
          </button>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Aggiornamento...' : 'Aggiorna Messaggio'}
          </button>
        </div>
      </form>

      {showHistory && (
        <div className="history-container">
          <h2>Cronologia Messaggi</h2>
          {history.length === 0 ? (
            <p>Nessuna versione precedente disponibile.</p>
          ) : (
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id} className="history-item">
                  <div className="history-content">
                    <div dangerouslySetInnerHTML={{ __html: item.html_content }}></div>
                  </div>
                  <div className="history-meta">
                    <span className="history-date">{new Date(item.created_at).toLocaleString()}</span>
                    <button
                      className="restore-button"
                      onClick={() => restoreVersion(item.content, item.html_content, item.full_content || '', item.objectives_content || '')}
                    >
                      Ripristina
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="back-link">
        <a href="/">Torna alla home</a>
      </div>
    </div>
  );
};

export default AdminPage;
