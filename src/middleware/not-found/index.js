import httpStatus from 'http-status';

export default function notFound() {
  return (req, res) => {
    const status = httpStatus.NOT_FOUND;
    const message = `Cannot ${req.method} ${req.url}`;
    return res.status(status).json({
      status,
      message,
    });
  };
}
