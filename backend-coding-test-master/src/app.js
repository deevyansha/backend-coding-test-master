const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
const buildSchemas = require('./src/schemas');
const ridesRouter = require('./routes/rides');

const app = express();
const jsonParser = bodyParser.json();

// Build the database schema
db.serialize(() => {
    buildSchemas(db);
});

// Mount the rides router
app.use('/rides', ridesRouter);

// Health check endpoint
app.get('/health', (req, res) => res.send('Healthy'));

// Start the server
const port = process.env.PORT || 8010;
const server = app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

module.exports = server;
