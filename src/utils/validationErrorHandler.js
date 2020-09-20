import Boom from "@hapi/boom";
import mongoose from "mongoose";

/**
 * Forwards a mongoose `ValidationError` as a `Boom.badData` error.
 * The `meta` property will be added to the error data with extra validation information.
 * @type {import("express-serve-static-core").ErrorRequestHandler}
 */
export const validationErrorHandler = (err, req, res, next) => {
  if (!err) {
    return next();
  }
  if (!(err instanceof mongoose.Error.ValidationError)) {
    return next(err);
  }
  return next(
    Boom.badData(err.message, {
      meta: Object.fromEntries(
        Object.entries(err.errors).map(([key, { message, kind, path, value, reason }]) => [
          key,
          { message, kind, path, value, reason },
        ])
      ),
    })
  );
};
