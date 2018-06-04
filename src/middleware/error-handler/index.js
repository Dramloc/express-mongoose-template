import httpStatus from 'http-status';

export default function errorHandler() {
  return (err, req, res, next) => {
    if (!err) {
      return next();
    }
    const status = err.status || httpStatus.INTERNAL_SERVER_ERROR;
    const message = err.message || httpStatus['500_MESSAGE'];
    return res.status(status).json({
      status,
      message,
    });
  };
}
