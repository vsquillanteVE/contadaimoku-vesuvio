import React, { useState, useEffect, useRef } from 'react';
import LoginForm from './LoginForm';
import { getMessage, updateMessage, getMessageHistory } from '../services/api';
import { Editor } from '@tinymce/tinymce-react';
import Logo from './Logo';
import { Editor as TinyMCEEditor } from 'tinymce';

interface MessageHistory {
  id: number;
  content: string;
  html_content: string;
  full_content?: string;
  objectives_content?: string;
  created_at: string;
}

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

  // Aggiorna il contenuto degli editor quando cambia lo stato
  useEffect(() => {
    if (objectivesEditorRef.current && objectivesContent) {
      // Verifica se il contenuto è già caricato nell'editor
      const currentContent = objectivesEditorRef.current.getContent();
      if (currentContent !== objectivesContent) {
        objectivesEditorRef.current.setContent(objectivesContent);
      }
    }
  }, [objectivesContent]);

  useEffect(() => {
    if (contentEditorRef.current && fullContent) {
      // Verifica se il contenuto è già caricato nell'editor
      const currentContent = contentEditorRef.current.getContent();
      if (currentContent !== fullContent) {
        contentEditorRef.current.setContent(fullContent);
      }
    }
  }, [fullContent]);

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

  // Riferimenti agli editor TinyMCE
  const objectivesEditorRef = useRef<TinyMCEEditor | null>(null);
  const contentEditorRef = useRef<TinyMCEEditor | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Recupera il contenuto direttamente dagli editor
    const currentObjectivesContent = objectivesEditorRef.current ? objectivesEditorRef.current.getContent() : objectivesContent;
    const currentFullContent = contentEditorRef.current ? contentEditorRef.current.getContent() : fullContent;

    if (!currentFullContent.trim()) {
      setStatus('Il contenuto della pagina non può essere vuoto');
      return;
    }

    try {
      setLoading(true);
      setStatus('Aggiornamento in corso...');

      // Utilizziamo il contenuto HTML dell'editor WYSIWYG come messaggio in evidenza
      // Estraiamo i primi 100 caratteri per il messaggio in evidenza
      const shortContent = currentFullContent.replace(/<[^>]*>/g, '').substring(0, 100);
      const shortHtmlContent = `<p>${shortContent}...</p>`;

      const updatedMessage = await updateMessage(shortContent, shortHtmlContent, currentFullContent, currentObjectivesContent, username, password);

      // Aggiorniamo lo stato locale con i valori recuperati dagli editor
      setFullContent(currentFullContent);
      setObjectivesContent(currentObjectivesContent);
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
      <header className="header">
        <div className="logo-container">
          <img src="/logo.png" alt="Logo Capitolo Litorale Vesuviano" className="logo-image" />
          <h1>Amministrazione</h1>
        </div>
        <p className="admin-description">
          Benvenuto, {username}!<br />
          Qui puoi modificare il messaggio principale visualizzato nella home page.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="editor-section">
          <h3>Modifica gli obiettivi:</h3>
          <div className="editor-container">
            <Editor
              onInit={(evt, editor) => objectivesEditorRef.current = editor}
              initialValue={objectivesContent}
              apiKey="33wgnmi1idh0idd4g7obb8eqhq8c68y3ce8mn2yh6ld2xiuq"
              init={{
                height: 250,
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'charmap',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'table', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'link | removeformat | help',
                content_style: 'body { font-family:"Segoe UI","Roboto","Helvetica Neue",sans-serif; font-size:18px }',
                skin: 'oxide',
                promotion: false,
                statusbar: false,
                resize: false,
                browser_spellcheck: true,
                contextmenu: false,
                paste_data_images: true,
                paste_as_text: false,
                paste_merge_formats: true,
                paste_webkit_styles: 'all',
                paste_retain_style_properties: 'all',
                paste_remove_styles_if_webkit: false,
                paste_filter_drop: false,
                entity_encoding: 'raw',
                forced_root_block: 'p',
                valid_elements: '*[*]',
                valid_children: '+body[style],+div[style]',
                extended_valid_elements: 'img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name]',
                fix_list_elements: true,
                keep_styles: true,
                schema: 'html5',
                apply_source_formatting: false,
                convert_urls: false,
                relative_urls: false,
                remove_script_host: false
              }}
            />
            <p className="help-text">
              Inserisci gli obiettivi come elementi di lista. Questi verranno visualizzati come elenco puntato nella home page.
            </p>
          </div>

          <h3>Modifica il contenuto della pagina:</h3>
          <div className="editor-container">
            <Editor
              onInit={(evt, editor) => contentEditorRef.current = editor}
              initialValue={fullContent}
              apiKey="33wgnmi1idh0idd4g7obb8eqhq8c68y3ce8mn2yh6ld2xiuq"
              init={{
                height: 400,
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'link image | removeformat | help',
                content_style: 'body { font-family:"Segoe UI","Roboto","Helvetica Neue",sans-serif; font-size:18px }',
                skin: 'oxide',
                promotion: false,
                statusbar: false,
                resize: false,
                browser_spellcheck: true,
                contextmenu: false,
                paste_data_images: true,
                paste_as_text: false,
                paste_merge_formats: true,
                paste_webkit_styles: 'all',
                paste_retain_style_properties: 'all',
                paste_remove_styles_if_webkit: false,
                paste_filter_drop: false,
                entity_encoding: 'raw',
                forced_root_block: 'p',
                valid_elements: '*[*]',
                valid_children: '+body[style],+div[style]',
                extended_valid_elements: 'img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name]',
                fix_list_elements: true,
                keep_styles: true,
                schema: 'html5',
                apply_source_formatting: false,
                convert_urls: false,
                relative_urls: false,
                remove_script_host: false
              }}
            />
            <p className="help-text">
              Inserisci il contenuto HTML della pagina. Puoi formattare il testo usando gli strumenti dell'editor.
            </p>
          </div>
        </div>

        {status && (
          <div className={`status-message ${status.includes('successo') ? 'success' : 'error'}`}>
            {status}
          </div>
        )}
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
