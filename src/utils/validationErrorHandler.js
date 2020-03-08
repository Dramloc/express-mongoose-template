import Boom from "@hapi/boom";

export const validationErrorHandler = (err, req, res, next) => {
  if (!err) {
    return next();
  }
  if (!Boom.isBoom(err) || err.typeof !== Boom.badData) {
    return next(err);
  }
  const { output, data } = err;
  return res.status(output.statusCode).json({
    ...output.payload,
    meta: Object.fromEntries(
      Object.entries(data.errors).map(([key, value]) => [key, value.properties])
    )
  });
};
