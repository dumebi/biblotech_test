// Package Dependencies
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('./helpers/logger');
const cors = require('cors');
const compression = require('compression');
const flash = require('connect-flash');
const {
  logRequest
} = require('./helpers/middleware');

const app = express();
require('dotenv').config();
require('./helpers/connection').mongo();
require('./helpers/connection').rabbitmq();
require('./helpers/connection').subscribe();

// Midelware stack
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(cors());
app.use(compression());
app.use(flash());
// app.use(logRequest);

/* Application Routes */
app.use('/', require('./routes'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  logger.logAPIResponse(req, res);
  const error = {
    http: 404,
    status: 'failed',
    message: 'Page Not Found'
  };
  next(error);
});

app.listen(3000, () => console.log(`Open http://localhost:3000 to see a response.`));
