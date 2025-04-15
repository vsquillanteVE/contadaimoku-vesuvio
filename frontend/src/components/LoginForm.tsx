import React, { useState } from 'react';
import { login } from '../services/api';

interface LoginFormProps {
  onLoginSuccess: (username: string, password: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('LoginForm submit');

    if (!username.trim() || !password.trim()) {
      setError('Username e password sono obbligatori');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Attempting login with:', username);

      const user = await login(username, password);
      console.log('Login successful, user:', user);
      onLoginSuccess(username, password);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response && error.response.status === 401) {
        setError('Credenziali non valide');
      } else {
        setError('Errore durante il login. Riprova più tardi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Accesso Amministratore</h2>
      <p className="login-description">
        Inserisci le tue credenziali per accedere all'area di amministrazione.
      </p>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className="text-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="text-input"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Accesso in corso...' : 'Accedi'}
        </button>
      </form>

      <div className="back-link">
        <a href="/">Torna alla home</a>
      </div>
    </div>
  );
};

export default LoginForm;
