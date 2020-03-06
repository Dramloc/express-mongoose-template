import Boom from "@hapi/boom";

export const errorHandler = (err, req, res, next) => {
  if (!err) {
    return next();
  }
  req.log.error(err.stack);
  const { output } = Boom.boomify(err);
  return res
    .set(output.headers)
    .status(output.statusCode)
    .json(output.payload);
};
