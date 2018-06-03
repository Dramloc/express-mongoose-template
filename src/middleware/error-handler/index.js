export default function errorHandler() {
  return (err, req, res, next) => {
    if (!err) {
      return next();
    }
    const status = err.status || 500;
    const message = err.message || 'Unexpected error';
    return res.status(status).json({
      status,
      message,
    });
  };
}
