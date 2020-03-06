import Boom from "@hapi/boom";

export const notFoundHandler = (req, res) => {
  const { output } = Boom.notFound(`Cannot ${req.method} ${req.url}`);
  return res.status(output.statusCode).json(output.payload);
};
