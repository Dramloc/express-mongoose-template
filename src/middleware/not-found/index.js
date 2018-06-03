export default function notFound() {
  return (req, res) => {
    const status = 404;
    const message = `Cannot ${req.method} ${req.url}`;
    return res.status(status).json({
      status,
      message,
    });
  };
}
