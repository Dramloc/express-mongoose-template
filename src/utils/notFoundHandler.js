import Boom from "@hapi/boom";

/**
 * Forwards a `Boom.notFound` error (404) if no middleware handled the request.
 * @type {import('express').RequestHandler}
 */
export const notFoundHandler = (req, res, next) => {
  return next(Boom.notFound(`Cannot ${req.method} ${req.path}`));
};
