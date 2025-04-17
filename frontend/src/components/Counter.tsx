import React, { useState, useEffect } from 'react';
import { getCount, incrementCount } from '../services/api';
import TimeInputModal from './TimeInputModal';
import { useSpring, animated } from 'react-spring';

const Counter: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showThankYou, setShowThankYou] = useState<boolean>(false);

  // Animazione per il numero
  const props = useSpring({
    number: count,
    from: { number: 0 },
    config: { mass: 1, tension: 20, friction: 10 },
  });

  const fetchCount = async () => {
    try {
      setLoading(true);
      const currentCount = await getCount();
      setCount(currentCount);
      setError(null);
    } catch (err) {
      setError('Failed to fetch count');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();

    // Aggiorna il conteggio ogni 30 secondi
    const intervalId = setInterval(() => {
      fetchCount();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const handleIncrement = async () => {
    try {
      const newCount = await incrementCount(1);
      setCount(newCount);
    } catch (err) {
      setError('Failed to increment count');
      console.error(err);
    }
  };

  if (loading && count === 0) {
    return <div className="counter-loading">Loading...</div>;
  }

  if (error && count === 0) {
    return <div className="counter-error">{error}</div>;
  }

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Funzione per mostrare il messaggio di ringraziamento
  const showThankYouMessage = () => {
    setShowThankYou(true);
    setTimeout(() => {
      setShowThankYou(false);
    }, 3000); // Il messaggio scompare dopo 3 secondi
  };

  // Funzione per aggiornare il conteggio e mostrare il messaggio di ringraziamento
  const updateCount = (newCount: number) => {
    setCount(newCount);
    showThankYouMessage();

    // Aggiorna il conteggio dopo un breve ritardo per assicurarsi che il server abbia elaborato la richiesta
    setTimeout(() => {
      fetchCount();
    }, 1000);
  };

  return (
    <div className="counter-container">
      <div className="counter-logo-mobile">
        <img src="/logo.png" alt="Logo Capitolo Litorale Vesuviano" className="counter-logo-image" />
      </div>
      <div className="counter-display">
        <animated.h1 className="counter-value">
          {props.number.to(n => Math.floor(n))}
        </animated.h1>
      </div>

      {showThankYou && (
        <div className="thank-you-message">
          <p>Grazie! Stai incoraggiando anche tante altre persone a fare daimoku.</p>
        </div>
      )}
      <div className="counter-buttons">
        <button className="counter-button time-button" onClick={openModal}>
          Aggiungi Daimoku
        </button>
      </div>

      <TimeInputModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        onCountUpdated={updateCount}
      />
    </div>
  );
};

export default Counter;
