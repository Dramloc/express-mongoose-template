import Boom from "@hapi/boom";

/**
 * Throws a 404 ("Not Found") if no middleware before itself handled the request.
 * @type {import("express").RequestHandler}
 */
export const notFoundHandler = (req, res, next) => {
  return next(Boom.notFound(`Cannot ${req.method} ${req.url}`));
};
