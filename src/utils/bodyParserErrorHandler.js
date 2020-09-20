import Boom from "@hapi/boom";

export const bodyParserErrorHandler = (err, req, res, next) => {
  if (!err) {
    return next();
  }
  if (!(err instanceof SyntaxError)) {
    return next(err);
  }
  return next(Boom.badData(err.message));
};
