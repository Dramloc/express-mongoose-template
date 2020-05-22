/**
 * @typedef ValidationErrorMeta
 * @property {string} message The validation error message
 * @property {string} type The validation error type (e.g.: "required", "unique", etc.)
 * @property {string} path The document path that failed validation
 * @property {any} [value] The value that did not pass validation (used by mongoose-unique-validator)
 * @property {any} [reason] The reason why value did not pass validation.
 */

import Boom from "@hapi/boom";

/**
 * @typedef FormattedValidationError
 * @property {number} statusCode The error HTTP status code (422)
 * @property {string} error The error HTTP status message ("Unprocessable Entity")
 * @property {string} message The validation error message
 * @property {{[key: string]: ValidationErrorMeta}} meta Additional information about the validation error
 */

/**
 * Format `Boom.badData` (422) errors to give additional validation information.
 * This handler expects that the `Boom.badData` received the mongoose `ValidationError` as additional error data.
 * The `meta` property will be added to the response with
 * @type {import("express-serve-static-core").ErrorRequestHandler<import("express-serve-static-core").ParamsDictionary, FormattedValidationError>}
 */
export const validationErrorHandler = (err, req, res, next) => {
  if (!err) {
    return next();
  }
  if (err.name !== "ValidationError") {
    return next(err);
  }
  const { output } = Boom.badData(err);
  return res.status(output.statusCode).json({
    ...output.payload,
    meta: Object.fromEntries(
      Object.entries(err.errors).map(([key, value]) => [key, value.properties])
    )
  });
};
