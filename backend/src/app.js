const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const apiRoutes = require('./routes');
const asyncHandler = require('./utils/asyncHandler');
const { notFound, errorHandler } = require('./utils/errorHandlers');

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Safety wrapper to ensure `next` exists for all routes
app.use((req, res, next) => asyncHandler(() => next())(req, res, next));
app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

