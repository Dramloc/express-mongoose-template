import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';

import config from './config';
import errorHandler from './middleware/error-handler';
import images from './images';
import notFound from './middleware/not-found';

import createLogger from './logger';

const logger = createLogger('boot');
logger.info('server process starting');

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
app.use('/api/v1/images', images);

// Error handler
app.use(errorHandler());
// Not found handler
app.use(notFound());

logger.info(`connecting to database ${config.mongodb.url}`);
mongoose.connect(config.mongodb.url, config.mongodb.options);
mongoose.connection
  .on('error', (error) => {
    logger.error(`unable to connect to database ${config.mongodb.url}`, error);
    process.exit(10);
  })
  .once('open', () => {
    logger.info(`connection to database ${config.mongodb.url} established`);
    logger.info(`starting http server on http://${config.host}:${config.port}`);
    app.listen(config.port, config.host, (error) => {
      if (error) {
        logger.error(`unable to start http server on http://${config.host}:${config.port}`, error);
        process.exit(10);
      }
      logger.info(`http server started on http://${config.host}:${config.port}`);
    });
  });

export default app;
