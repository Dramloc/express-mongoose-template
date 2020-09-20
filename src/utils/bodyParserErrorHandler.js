import Boom from "@hapi/boom";

/**
 * Forwards `SyntaxError` as a `Boom.badRequest` error (400).
 * @type {import('express').ErrorRequestHandler}
 */
export const bodyParserErrorHandler = (err, req, res, next) => {
  if (!err) {
    return next();
  }
  if (!(err instanceof SyntaxError)) {
    return next(err);
  }
  return next(Boom.badRequest(err.message));
};
