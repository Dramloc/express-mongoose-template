import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import winston from 'winston';

import config from './config';
import errorHandler from './middleware/error-handler';
import notFound from './middleware/not-found';

winston.info('Server process starting');

const app = express();

// HTTP request logger
app.use(morgan('dev'));
// Add HTTP Headers security
app.use(helmet());
// GZIP compression
app.use(compression());
// Parse HTTP JSON bodies
app.use(bodyParser.json());
// Enable CORS
app.use(cors());

// Mount API endpoints

// Error handler
app.use(errorHandler());
// Not found handler
app.use(notFound());

winston.info(`Connecting to database ${config.mongodb.url}...`);
mongoose.connect(config.mongodb.url, config.mongodb.options);
mongoose.connection
  .on('error', (error) => {
    winston.error(`Unable to connect to database ${config.mongodb.url}.`, error);
    process.exit(10);
  })
  .once('open', () => {
    winston.info(`Connection to database ${config.mongodb.url} established.`);
    winston.info(`Starting http server on http://${config.host}:${config.port}...`);
    app.listen(config.port, config.host, (error) => {
      if (error) {
        winston.error(
          `Unable to start http server on http://${config.host}:${config.port}.`,
          error,
        );
        process.exit(10);
      }
      winston.info(`Http server started on http://${config.host}:${config.port}.`);
    });
  });

export default app;
