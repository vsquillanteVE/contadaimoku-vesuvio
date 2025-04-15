// Database in memoria
interface Message {
  content: string;
  htmlContent: string;
  fullContent: string;
  objectivesContent: string;
}

interface User {
  id: number;
  username: string;
  password: string;
}

interface MessageHistoryItem {
  id: number;
  content: string;
  html_content: string;
  full_content: string;
  objectives_content: string;
  created_at: string;
}

interface InMemoryDB {
  counter: number;
  message: Message;
  messageHistory: MessageHistoryItem[];
  users: User[];
}

const inMemoryDB: InMemoryDB = {
  counter: 0,
  message: {
    content: 'Niente può distruggere i tesori del cuore.',
    htmlContent: '<p>Niente può distruggere i tesori del cuore.</p>',
    fullContent: '<div class="message-highlight"><p>Niente può distruggere i tesori del cuore.</p></div>',
    objectivesContent: '<li>Realizziamo in Unità 10.000.000 di Daimoku per la protezione e la buona salute di tutti i praticanti e di tutti i cittadini del Vesuvio</li><li>Studiamo insieme le guide di Sensei</li>'
  },
  messageHistory: [],
  users: [
    { id: 1, username: 'admin', password: 'vesuvio2025' }
  ]
};

// Get the current count
export function getCount(): number {
  return inMemoryDB.counter;
}

// Increment the count
export function incrementCount(amount: number = 1): number {
  inMemoryDB.counter += amount;
  return inMemoryDB.counter;
}

// Reset the count (for testing purposes)
export function resetCount(): boolean {
  inMemoryDB.counter = 0;
  return true;
}

// Get the current message
export function getMessage(): Message {
  return inMemoryDB.message;
}

// Update the message
export function updateMessage(content: string, htmlContent: string, fullContent: string, objectivesContent: string): Message {
  // Add to history first
  inMemoryDB.messageHistory.push({
    id: inMemoryDB.messageHistory.length + 1,
    content: inMemoryDB.message.content,
    html_content: inMemoryDB.message.htmlContent,
    full_content: inMemoryDB.message.fullContent,
    objectives_content: inMemoryDB.message.objectivesContent,
    created_at: new Date().toISOString()
  });

  // Update current message
  inMemoryDB.message = {
    content,
    htmlContent,
    fullContent,
    objectivesContent
  };

  return inMemoryDB.message;
}

// Get message history
export function getMessageHistory(limit: number = 10): MessageHistoryItem[] {
  return inMemoryDB.messageHistory.slice(0, limit);
}

// Authenticate user
export function authenticateUser(username: string, password: string): User | null {
  const user = inMemoryDB.users.find(u => u.username === username && u.password === password);
  return user || null;
}
