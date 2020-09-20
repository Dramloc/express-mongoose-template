import Boom from "@hapi/boom";

/**
 * Format errors passed down the middleware chain using `Boom.boomify`.
 * Error stack trace will also be logged for programming errors.
 * If the `err` variable is not a Boom error, the status code will defaults to 500.
 * Otherwise, the status code associated with the Boom error will be used.
 * @type {import("express").ErrorRequestHandler>}
 */
export const errorHandler = (err, req, res, next) => {
  if (!err) {
    return next();
  }
  /* istanbul ignore next */
  if (process.env.NODE_ENV !== "test" && !Boom.isBoom(err)) {
    console.error(err.stack);
  }
  const { output, data } = Boom.boomify(err);
  return res
    .set(output.headers)
    .status(output.statusCode)
    .json({ ...output.payload, ...data });
};
