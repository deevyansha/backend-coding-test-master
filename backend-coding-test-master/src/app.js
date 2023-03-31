const express = require('express');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const db = require('./db');

const ridesRouter = require('./routes/rides');

const app = express();
const jsonParser = bodyParser.json();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const buildSchemas = require('./src/schemas');

db.serialize(() => {
    buildSchemas(db);

    const app = require('./src/app')(db);
});

// Apply rate limiting middleware
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/rides', limiter, ridesRouter);

app.get('/health', (req, res) => res.send('Healthy'));

const port = process.env.PORT || 8010;

const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

module.exports = server;
