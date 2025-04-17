import React, { useState } from 'react';
import Modal from 'react-modal';
import { incrementCount } from '../services/api';

// Imposta l'elemento root dell'app per l'accessibilità
Modal.setAppElement('#root');

interface TimeInputModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onCountUpdated: (newCount: number) => void;
}

const TimeInputModal: React.FC<TimeInputModalProps> = ({ isOpen, onRequestClose, onCountUpdated }) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Stile personalizzato per la modale
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '400px',
      width: '90%',
      padding: '20px',
      borderRadius: '8px',
      zIndex: 9999,
      position: 'relative',
      backgroundColor: 'white',
      boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5)',
      border: '1px solid rgba(0, 0, 0, 0.2)',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 9998,
      backdropFilter: 'blur(5px)',
    },
  };

  // Gestisce il cambio del valore delle ore
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Rimuove lo zero iniziale e converte in numero
    const inputValue = e.target.value.replace(/^0+/, '');
    const value = inputValue === '' ? 0 : parseInt(inputValue);
    setHours(isNaN(value) ? 0 : value);
  };

  // Gestisce il cambio del valore dei minuti
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Rimuove lo zero iniziale e converte in numero
    const inputValue = e.target.value.replace(/^0+/, '');
    const value = inputValue === '' ? 0 : parseInt(inputValue);
    setMinutes(isNaN(value) ? 0 : value);
  };

  // Converte ore e minuti in conteggio Daimoku (1 minuto = 1 Daimoku)
  const convertTimeToCount = (): number => {
    return (hours * 60) + minutes;
  };

  // Gestisce l'invio del form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const count = convertTimeToCount();

    if (count <= 0) {
      setError('Inserisci un valore maggiore di zero');
      return;
    }

    try {
      setError(null);
      const newCount = await incrementCount(count);
      onCountUpdated(newCount);
      onRequestClose();
    } catch (err) {
      setError('Errore durante l\'aggiornamento del conteggio');
      console.error(err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Inserisci Tempo Daimoku"
    >
      <h2 className="modal-title">Aggiungi Daimoku</h2>
      <p className="modal-description">
        Inserisci il tempo dedicato alla recitazione del Daimoku.
        Ogni minuto verrà conteggiato come 1 Daimoku.
      </p>

      <form onSubmit={handleSubmit} className="time-input-form">
        <div className="form-group">
          <label htmlFor="hours">Ore:</label>
          <input
            id="hours"
            type="number"
            min="0"
            value={hours || ''}
            onChange={handleHoursChange}
            className="time-input"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="minutes">Minuti:</label>
          <input
            id="minutes"
            type="number"
            min="0"
            max="59"
            value={minutes || ''}
            onChange={handleMinutesChange}
            className="time-input"
            placeholder="0"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="modal-buttons">
          <button type="button" onClick={onRequestClose} className="cancel-button">
            Annulla
          </button>
          <button type="submit" className="submit-button">
            Aggiungi
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TimeInputModal;
