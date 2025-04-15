"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = exports.getMessageHistory = exports.updateMessage = exports.getMessage = exports.resetCount = exports.incrementCount = exports.getCount = void 0;

// Database in memoria
const inMemoryDB = {
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
function getCount() {
    return inMemoryDB.counter;
}
exports.getCount = getCount;

// Increment the count
function incrementCount(amount = 1) {
    inMemoryDB.counter += amount;
    return inMemoryDB.counter;
}
exports.incrementCount = incrementCount;

// Reset the count (for testing purposes)
function resetCount() {
    inMemoryDB.counter = 0;
    return true;
}
exports.resetCount = resetCount;

// Get the current message
function getMessage() {
    return inMemoryDB.message;
}
exports.getMessage = getMessage;

// Update the message
function updateMessage(content, htmlContent, fullContent, objectivesContent) {
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
exports.updateMessage = updateMessage;

// Get message history
function getMessageHistory(limit = 10) {
    return inMemoryDB.messageHistory.slice(0, limit);
}
exports.getMessageHistory = getMessageHistory;

// Authenticate user
function authenticateUser(username, password) {
    const user = inMemoryDB.users.find(u => u.username === username && u.password === password);
    return user || null;
}
exports.authenticateUser = authenticateUser;
