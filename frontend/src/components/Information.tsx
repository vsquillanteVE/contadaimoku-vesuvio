import React, { useState, useEffect } from 'react';
import { getMessage } from '../services/api';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Information: React.FC = () => {
  const [message, setMessage] = useState<string>('Niente può distruggere i tesori del cuore.');
  const [htmlContent, setHtmlContent] = useState<string>('<p>Niente può distruggere i tesori del cuore.</p>');
  const [fullContent, setFullContent] = useState<string>('<div class="message-highlight"><p>Niente può distruggere i tesori del cuore.</p></div>');
  const [objectivesContent, setObjectivesContent] = useState<string>('<li>Realizziamo in Unità 10.000.000 di Daimoku per la protezione e la buona salute di tutti i praticanti e di tutti i cittadini del Vesuvio</li><li>Studiamo insieme le guide di Sensei</li>');

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
      }
    };

    fetchMessage();
  }, []);
  return (
    <div className="information-container">
      <ul className="information-list" dangerouslySetInnerHTML={{ __html: objectivesContent }}></ul>

      <div className="message-container" dangerouslySetInnerHTML={{ __html: fullContent }}></div>

      <footer className="footer">
        <p>Capitolo Litorale Vesuviano</p>
        <div className="admin-link">
          <Link to="/admin-vesuvio">Amministrazione</Link>
        </div>
      </footer>
    </div>
  );
};

export default Information;
