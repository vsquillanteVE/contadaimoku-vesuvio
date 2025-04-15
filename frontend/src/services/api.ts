import axios from 'axios';

// URL dell'API in produzione (Vercel)
const PROD_API_URL = 'https://contadaimoku-vesuvio-be.vercel.app/api';
// URL dell'API in sviluppo (locale)
const DEV_API_URL = 'http://localhost:3001/api';
// Usa l'URL di produzione o di sviluppo in base all'ambiente
const API_URL = process.env.NODE_ENV === 'production' ? PROD_API_URL : DEV_API_URL;

export const getCount = async (): Promise<number> => {
  try {
    const response = await axios.get(`${API_URL}/count`);
    return response.data.count;
  } catch (error) {
    console.error('Error fetching count:', error);
    return 0;
  }
};

export const incrementCount = async (amount: number = 1): Promise<number> => {
  try {
    const response = await axios.post(`${API_URL}/count`, { amount });
    return response.data.count;
  } catch (error) {
    console.error('Error incrementing count:', error);
    throw error;
  }
};

interface Message {
  content: string;
  htmlContent: string;
  fullContent?: string;
  objectivesContent?: string;
}

interface User {
  id: number;
  username: string;
}

interface MessageHistory {
  id: number;
  content: string;
  html_content: string;
  full_content?: string;
  objectives_content?: string;
  created_at: string;
}

export const getMessage = async (): Promise<Message> => {
  try {
    const response = await axios.get(`${API_URL}/message`);
    return response.data.message;
  } catch (error) {
    console.error('Error fetching message:', error);
    return {
      content: 'Niente può distruggere i tesori del cuore.',
      htmlContent: '<p>Niente può distruggere i tesori del cuore.</p>',
      fullContent: '<div class="message-highlight"><p>Niente può distruggere i tesori del cuore.</p></div>',
      objectivesContent: '<li>Realizziamo in Unità 10.000.000 di Daimoku per la protezione e la buona salute di tutti i praticanti e di tutti i cittadini del Vesuvio</li><li>Studiamo insieme le guide di Sensei</li>'
    };
  }
};

export const login = async (username: string, password: string): Promise<User> => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const updateMessage = async (content: string, htmlContent: string, fullContent: string, objectivesContent: string, username: string, password: string): Promise<Message> => {
  try {
    const response = await axios.post(`${API_URL}/message`, { content, htmlContent, fullContent, objectivesContent, username, password });
    return response.data.message;
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
};

export const getMessageHistory = async (limit: number = 10): Promise<MessageHistory[]> => {
  try {
    const response = await axios.get(`${API_URL}/message/history?limit=${limit}`);
    return response.data.history;
  } catch (error) {
    console.error('Error fetching message history:', error);
    return [];
  }
};
