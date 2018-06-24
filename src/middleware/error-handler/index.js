import httpStatus from 'http-status';

import createLogger from '../../logger';

const logger = createLogger('error-handler');

export default function errorHandler() {
  return (err, req, res, next) => {
    if (!err) {
      return next();
    }
    logger.error(err.stack);
    const status = err.status || httpStatus.INTERNAL_SERVER_ERROR;
    const message = err.message || httpStatus['500_MESSAGE'];
    return res.status(status).json({
      status,
      message,
      errors: err.errors,
    });
  };
}
