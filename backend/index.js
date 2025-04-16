// Carica le variabili d'ambiente
require('dotenv').config();

// Importa l'app Express
const app = require('./dist/index.js');

// Avvia il server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
